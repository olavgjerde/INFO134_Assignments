let introSection = document.getElementById("introduction");
let overviewSection = document.getElementById("overview");
let detailsSection = document.getElementById("details");
let comparisonSection = document.getElementById("comparison");
let sectionList = [introSection, overviewSection, detailsSection, comparisonSection];
let overviewTbody = document.getElementById("overviewBody");

let populationData, employmentData, educationData;
const FetchType = {
    "population": "http://wildboy.uib.no/~tpe056/folk/104857.json",
    "employment": "http://wildboy.uib.no/~tpe056/folk/100145.json",
    "education": "http://wildboy.uib.no/~tpe056/folk/85432.json"
};

/**
 * Sets the initial condition for the application
 *  - Hiding all sections except the introduction
 *  - Adding eventlisteners where needed
 */
function init() {
    document.getElementById("introButton").addEventListener("click", function () {
        toggleSectionVisibility(introSection);
    });
    document.getElementById("overviewButton").addEventListener("click", function () {
	    toggleSectionVisibility(overviewSection);
	    if (!populationData) {
		    populationData = new Dataset(FetchType.population);
		    populationData.onload = function () { populateOverview(); }
		    populationData.load();
	    }
    });
    document.getElementById("detailsButton").addEventListener("click", function () {
        toggleSectionVisibility(detailsSection);
    });
    document.getElementById("comparisonButton").addEventListener("click", function () {
        toggleSectionVisibility(comparisonSection);
    });

    overviewSection.classList.toggle("hiddenSection");
    detailsSection.classList.toggle("hiddenSection");
    comparisonSection.classList.toggle("hiddenSection");
}

/**
 * Shows a given section and hides all the other ones defined in "sectionList"
 * @param targetSection section-element which should become visible
 */
function toggleSectionVisibility(targetSection) {
    targetSection.classList.remove("hiddenSection");
    for (var id in sectionList) {
        let sectionInList = sectionList[id];
        if (sectionInList !== targetSection) {
            sectionInList.classList.add("hiddenSection");
        }
    }
}

/**
 * Populates the overview section of the application with data
 * from the dataset object defined on the "populationData" variable
 */
function populateOverview() {
	let municipalityIds = populationData.getIDs();

    for (let index in municipalityIds) {
	    let idElement = document.createElement("td");
	    let nameElement = document.createElement("td");
	    let populationElement = document.createElement("td");

	    let info = populationData.getInfo(municipalityIds[index]);
        nameElement.innerText = info["name"];
	    populationElement.innerText = info["men"] + info["women"];
	    idElement.innerText = municipalityIds[index];

	    let tableRow = document.createElement("tr");
	    tableRow.appendChild(nameElement);
	    tableRow.appendChild(idElement);
	    tableRow.appendChild(populationElement);
	    overviewTbody.appendChild(tableRow);
    }
}