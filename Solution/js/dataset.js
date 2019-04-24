function Dataset(contentUrl) {
    this.contentUrl = contentUrl;
    this.nameList = [];
    this.idList = [];
    this.datasetDict = {};
}

Dataset.prototype = {
    getNames: function () {
        return this.nameList;
    },
    getIDs: function () {
        return this.idList;
    },
    getInfo: function (districtId) {
        return this.datasetDict[districtId];
    },
    /**
     * Parses a response-object from the load-function into an object
     * where the municipality-codes are the keys and the values for every key are:
     * name of municipality, statistics for men, and statistics for women.
     * It calls onload() after parsing, if this function is defined.
     * @param responseObject object that will be parsed (see load function)
     */
    parseContent: function (responseObject) {
        let rootElement = responseObject["elementer"];
        for (let districtName in rootElement) {
            let districtId = rootElement[districtName]["kommunenummer"];
            this.nameList.push(districtName);
            this.idList.push(districtId);

            // section spesific to educational data
            // continue here: better to refactor into separate type?
            // for (let key in rootElement[districtName]) {
            //     if (key == "kommunenummer") continue;
            //     let eduType = educationMapper[key];
            //     let eduObject = {}
            //     eduObject[eduType] = {
            //         "men": rootElement[districtName][key]["Menn"],
            //         "women": rootElement[districtName][key]["Women"]
            //     }
            //     this.datasetDict[districtId] += eduObject;
            // }
            
            // section not dependant on dataset-type
            this.datasetDict[districtId] = {
                 "name": districtName,
		         "men": rootElement[districtName]["Menn"],
                 "women": rootElement[districtName]["Kvinner"],
                 "combo": rootElement[districtName]["Begge kjønn"],
                 // These functions assume correct order within json (asc. by year)
                 "menLatest": function () { return this.men[Object.keys(this.men)[Object.keys(this.men).length - 1]]},
                 "womenLatest": function() { return this.women[Object.keys(this.women)[Object.keys(this.women).length - 1]]},
                 "comboLatest": function() { if (this.combo) return this.combo[Object.keys(this.combo)[Object.keys(this.combo).length - 1]]}
            }
        }
        if (this.onload) this.onload();
    },
    /**
     * Fetches a given dataset defined by the contentUrl that was set during
     * the objects initialization.
     */
    load: function () {
        // TODO: 1. disable navigation | 2. set loading message
        let proto = this;
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                let responseObject = JSON.parse(request.responseText);
                proto.parseContent(responseObject);
            }
        }
        request.open("GET", this.contentUrl);
        request.send();
    },
    onload: null
}

const educationMapper = {
    "01": "primarySchool",
    "02a": "highSchool",
    "03a": "higherShort",
    "04a": "higherLong",
    "09a": "undefinedEdu",
    "11": "vocational"
}