let introSection = document.getElementById("introduction");
let overviewSection = document.getElementById("overview");
let detailsSection = document.getElementById("details");
let comparisonSection = document.getElementById("comparison");
let sectionList = [introSection, overviewSection, detailsSection, comparisonSection];
let populationData, employmentData, educationData;

const FetchType = {
    "population": "http://wildboy.uib.no/~tpe056/folk/104857.json",
    "employment": "http://wildboy.uib.no/~tpe056/folk/100145.json",
    "education": "http://wildboy.uib.no/~tpe056/folk/85432.json"
};

/**
 * Statistical year ranges for datasets.
 * Population: 2007 - 2018, Employment: 2005 - 2018, Education: 1970 - 2017
 * Hence an intersection is: 2007 - 2017
 */
const yearIntersection = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];

/**
 * Sets the initial condition for the application
 *  1. Hide all sections except the introduction
 *  2. Add eventlisteners where needed
 */
function init() {
    document.getElementById("introButton").onclick = function () {
        toggleSectionVisibility(introSection);
    }
    document.getElementById("overviewButton").onclick = function () {
        toggleSectionVisibility(overviewSection);
        if (!populationData) fetchPopulationData(populateOverview);
    }
    document.getElementById("detailsButton").onclick = function () {
        toggleSectionVisibility(detailsSection);
        if (!populationData) fetchPopulationData();
        if (!employmentData) fetchEmploymentData();
        if (!educationData) fetchEducationData();
        filterStatisticYears(populateDetails, employmentData, educationData);
    }
    document.getElementById("comparisonButton").onclick = function () {
        toggleSectionVisibility(comparisonSection);
        if (!employmentData) fetchEmploymentData();
    }

    document.getElementById("detailsSubmit").onclick = populateDetails;

    overviewSection.classList.toggle("hiddenSection");
    detailsSection.classList.toggle("hiddenSection");
    comparisonSection.classList.toggle("hiddenSection");
}

function fetchPopulationData(onloadFunction) {
    populationData = new SharedDataset(FetchType.population);
    populationData.onload = onloadFunction;
    populationData.load();
}

function fetchEmploymentData(onloadFunction) {
    employmentData = new SharedDataset(FetchType.employment);
    employmentData.onload = onloadFunction;
    employmentData.load();
}

function fetchEducationData(onloadFunction) {
    educationData = new EduDataset(FetchType.education);
    educationData.onload = onloadFunction;
    educationData.load();
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
    let overviewTbody = document.getElementById("overviewBody");
    let municipalityIds = populationData.getIDs();

    for (let index in municipalityIds) {
        let idElement = document.createElement("td");
        let nameElement = document.createElement("td");
        let populationElement = document.createElement("td");

        let info = populationData.getInfo(municipalityIds[index]);
        nameElement.innerText = info.name;
        populationElement.innerText = info.menLatest() + info.womenLatest();
        idElement.innerText = municipalityIds[index];

        let tableRow = document.createElement("tr");
        tableRow.appendChild(nameElement);
        tableRow.appendChild(idElement);
        tableRow.appendChild(populationElement);
        overviewTbody.appendChild(tableRow);
    }
}

function populateDetails() {
    let disctrictId = document.getElementById("detailsNumInput").value;
    //TODO: throw error if drisctrictId not a number || not available
    let disPopulationData = populationData.getInfo(disctrictId);
    let disEmploymentData = employmentData.getInfo(disctrictId);
    let disEducationData = educationData.getInfo(disctrictId);

    document.getElementById("dName").innerText = disPopulationData.name;
    document.getElementById("dNum").innerText = disctrictId

    let populationCount = disPopulationData.menLatest() + disPopulationData.womenLatest();
    document.getElementById("dPopulation").innerText = populationCount;

    document.getElementById("dEmploy").innerText = disEmploymentData.comboLatest() + "%";

    //TODO: account for year intersection.
    let higherEduPercent = disEducationData.higherLong.womenLatest() + disEducationData.higherLong.menLatest();
    let higherEduCount = Math.floor((populationCount / 100) * higherEduPercent);
    document.getElementById("dEducate").innerText = higherEduCount + " | " + higherEduPercent + "%";
    //TODO: add additional data 
}