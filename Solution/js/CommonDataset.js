/**
 * A CommonDataset object is meant to function as an interface against:
 *  - The population dataset (http://wildboy.uib.no/~tpe056/folk/104857.json)
 *  - The employment dataset (http://wildboy.uib.no/~tpe056/folk/100145.json)
 * @param contentUrl the url of the resource that this object should fetch
 */
function CommonDataset(contentUrl) {
    this.contentUrl = contentUrl;
    this.nameList = [];
    this.idList = [];
    this.datasetDict = {};
}

CommonDataset.prototype = {
    /**
     * Returns a list of all the district names contained within the dataset.
     */
    getNames: function () {
        return this.nameList;
    },
    /**
     * Returns a list of all the district-ids contained within the dataset.
     */
    getIds: function () {
        return this.idList;
    },
    /**
     * Returns an object with information about the district belonging
     * to the id given as a parameter.
     * @param districtId id of the district to fetch information about
     */
    getInfo: function (districtId) {
        return this.datasetDict[districtId];
    },
    /**
     * Parses a response-object from the load-function into an object
     * where the municipality-codes are the keys and the values for the various keys are:
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

            this.datasetDict[districtId] = {
                 "name": districtName,
		         "men": rootElement[districtName]["Menn"],
                 "women": rootElement[districtName]["Kvinner"],
                 "combo": rootElement[districtName]["Begge kjønn"],
                 "menForYear": function(year) { return this.men[year] },
                 "womenForYear": function(year) { return this.women[year] },
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
        let proto = this;
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                proto.parseContent(JSON.parse(request.responseText));
            }
        }
        request.open("GET", this.contentUrl);
        request.send();
    },
    /**
     * onload() is set to null as default until set to a function by the user
     */
    onload: null
}