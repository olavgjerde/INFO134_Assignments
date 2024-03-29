/**
 * An EduDataset object is meant to function as an interface against:
 * The education dataset (http://wildboy.uib.no/~tpe056/folk/85432.json)
 * @param contentUrl the url of the resource that this object should fetch
 */
function EduDataset(contentUrl) {
    this.contentUrl = contentUrl;
    this.nameList = [];
    this.idList = [];
    this.datasetDict = {};
}

EduDataset.prototype = {
    /**
     * @returns a list of all the district names contained within the dataset
     */
    getNames: function () {
        return this.nameList;
    },
    /**
     * @returns a list of all the district-ids contained within the dataset
     */
    getIds: function () {
        return this.idList;
    },
    /**
     * Looks for information about a particular district in the object's "dictionary".
     * @param districtId id of the district to fetch information about
     * @returns an object with information about particular district with the given id
     */
    getInfo: function (districtId) {
        return this.datasetDict[districtId];
    },
    /**
     * Parses a response-object from the load-function into an object where the 
     * municipality-codes are the keys and the values individually represent:
     * statistics for men & women sorted into education category.
     * It calls onload() after parsing, if this function is defined.
     * @param responseObject object that will be parsed (see load function)
     */
    parseContent: function (responseObject) {
        let rootElement = responseObject["elementer"];
        for (let districtName in rootElement) {
            let districtId = rootElement[districtName]["kommunenummer"];
            this.nameList.push(districtName);
            this.idList.push(districtId);

            // Object created can be retreived via the getInfo() method,
            // and has 'keys' for every education level in a district.
            let educationInfo = {}
            for (let innerKey in rootElement[districtName]) {
                if (innerKey == "kommunenummer") continue;
                let educationLevel = educationMapper[innerKey];
                
                // Creates an object to represent education-level
                // Contains helper functions to easily fetch statistical-data
                // for a education-level within a district.
                educationInfo[educationLevel] = {
                    "men": rootElement[districtName][innerKey]["Menn"],
                    "women": rootElement[districtName][innerKey]["Kvinner"],
                    "menForYear": function(year) { return this.men[year] },
                    "womenForYear": function(year) { return this.women[year] },
                }
            }
            this.datasetDict[districtId] = educationInfo;
        }
        if (this.onload) this.onload();
    },
    /**
     * Fetches a given dataset defined by the contentUrl that was set during
     * the objects initialization (constructor).
     */
    load: function () {
        let proto = this;
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.status == 404) throw new Error("Resource could not be found on the requested domain " + proto.contentUrl);
            else if (request.readyState == 4 && request.status == 200) {
                proto.parseContent(JSON.parse(request.responseText));
                // onload() gets called within parseContent()
            }
        }
        request.addEventListener("error", function() {
            throw new Error("There was a problem loading the dataset-resource for " + proto.contentUrl);
        })
        request.open("GET", this.contentUrl);
        request.send();
    },
    /**
     * onload() is set to null as default until set to a function by the user
     */
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