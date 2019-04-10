let introSection = document.getElementById("introduction");
let overviewSection = document.getElementById("overview");
let detailsSection = document.getElementById("details");
let comparisonSection = document.getElementById("comparison");
let sectionList = [introSection, overviewSection, detailsSection, comparisonSection];

let introNavButton = document.getElementById("introButton");
let detailsNavButton = document.getElementById("detailsButton");
let overviewNavButton = document.getElementById("overviewButton");
let comparisonNavButton = document.getElementById("comparisonButton");

/**
 * Sets the initial condition for the application
 *  - Hiding all sections except the introduction
 *  - Adding eventlisteners where needed
 */
function init() {
    introNavButton.addEventListener("click", function() {
	    toggleSectionVisibility(introSection);
    });
    detailsNavButton.addEventListener("click", function() {
	    toggleSectionVisibility(detailsSection);
    });
    overviewNavButton.addEventListener("click", function() {
	    toggleSectionVisibility(overviewSection);
    });
    comparisonNavButton.addEventListener("click", function() {
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