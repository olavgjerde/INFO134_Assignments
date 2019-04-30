function EduDataset(contentUrl) {
    this.contentUrl = contentUrl;
    this.nameList = [];
    this.idList = [];
    this.datasetDict = {};
}

EduDataset.prototype = {
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
     * name of municipality and statistics for men & women sorted into education category.
     * It calls onload() after parsing, if this function is defined.
     * @param responseObject object that will be parsed (see load function)
     */
    parseContent: function (responseObject) {
        let rootElement = responseObject["elementer"];
        for (let districtName in rootElement) {
            let districtId = rootElement[districtName]["kommunenummer"];
            this.nameList.push(districtName);
            this.idList.push(districtId);

            let containerObject = {}
            containerObject["name"] = districtName;

            for (let innerKey in rootElement[districtName]) {
                if (innerKey == "kommunenummer") continue;
                let eduType = educationMapper[innerKey];
                containerObject[eduType] = {
                    "men": rootElement[districtName][innerKey]["Menn"],
                    "women": rootElement[districtName][innerKey]["Kvinner"],
                    "menForYear": function(year) { return this.men[year] },
                    "womenForYear": function(year) { return this.women[year] },
                    // These functions assume correct order within json (asc. by year)
                    "menLatest": function () { return this.men[Object.keys(this.men)[Object.keys(this.men).length - 1]]},
                    "womenLatest": function() { return this.women[Object.keys(this.women)[Object.keys(this.women).length - 1]]},
                }
            }
            
            this.datasetDict[districtId] = containerObject;
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

/**
 *  Maps the statistical notation for education-level to a more readable notation,
 *  to be used as keys for the dataset-objects.
 */ 
const educationMapper = {
    "01": "primarySchool",
    "02a": "highSchool",
    "03a": "higherShort",
    "04a": "higherLong",
    "09a": "undefinedEdu",
    "11": "vocational"
}