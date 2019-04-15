function Dataset(contentUrl) {
    this.contentUrl = contentUrl;
    this.datasetDict = {};
}

Dataset.prototype = {
    getNames: function* () {
        for (let id in this.datasetDict) {
            yield this.datasetDict[id]["name"];
        }
    },
    getIDs: function () {
        return Object.keys(this.datasetDict);
    },
    getInfo: function (id) {
        return this.datasetDict[id];
    },
    /**
     * Parses a response-object from the load-function into an object
     * where the municipality-codes are the keys and the values for every key are:
     * name of municipality, statistics for men, and statistics for women.
     * It calls onload() after parsing, if this function is defined.
     * @param responseObject object that will be parsed (see load function)
     */
    parseContent: function (responseObject) {
        let contentRoot = responseObject["elementer"];
        for (let id in contentRoot) {
            let menObj = contentRoot[id]["Menn"];
            let womenObj = contentRoot[id]["Kvinner"];
            // This assumes correct order within json (asc. by year)
            let menValue = menObj[Object.keys(menObj)[Object.keys(menObj).length - 1]];
            let womenValue = womenObj[Object.keys(womenObj)[Object.keys(womenObj).length - 1]];
            this.datasetDict[contentRoot[id]["kommunenummer"]] = {
                "name": id,
		        "men": menValue,
                "women": womenValue
            }
        }
        if (this.onload) this.onload();
    },
    /**
     * Fetches a given dataset defined by the contentUrl that was set during
     * the objects initialization.
     */
    load: function () {
        // TODO:
	    // 1. disable navigation
        // 2. set loading message

        // 3. fetch dataset and ready the object:
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