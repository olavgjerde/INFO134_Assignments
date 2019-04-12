let introSection = document.getElementById("introduction");
let overviewSection = document.getElementById("overview");
let detailsSection = document.getElementById("details");
let comparisonSection = document.getElementById("comparison");
let sectionList = [introSection, overviewSection, detailsSection, comparisonSection];

let populationData, employmentData, educationData;

/**
 * Sets the initial condition for the application
 *  - Hiding all sections except the introduction
 *  - Adding eventlisteners where needed
 */
function init() {
    document.getElementById("introButton").addEventListener("click", function() {
	    toggleSectionVisibility(introSection);
    });
    document.getElementById("detailsButton").addEventListener("click", function() {
	    toggleSectionVisibility(detailsSection);
    });
    document.getElementById("overviewButton").addEventListener("click", function() {
	    toggleSectionVisibility(overviewSection);
    });
    document.getElementById("comparisonButton").addEventListener("click", function() {
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
    for (var sectionId in sectionList) {
	    let sectionInList = sectionList[sectionId];
        if (sectionInList !== targetSection) {
	        sectionInList.classList.add("hiddenSection");
        }
    }
}

function fetchPopulationData() {
	let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
	        populationData = JSON.parse(request.responseText);
        }
    }
    request.open("GET", "http://wildboy.uib.no/~tpe056/folk/104857.json");
    request.send();
}