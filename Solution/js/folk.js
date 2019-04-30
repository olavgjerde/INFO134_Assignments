let introSection = document.getElementById("introduction");
let overviewSection = document.getElementById("overview");
let detailsSection = document.getElementById("details");
let comparisonSection = document.getElementById("comparison");
let sectionList = [introSection, overviewSection, detailsSection, comparisonSection];

let populationData, employmentData, educationData;
let overviewPopulated = false;

// Fetch DOM element to use as a template for history-elements
let historyContainer = document.getElementById("detailsHistory");
let historyElementTemplate = historyContainer.getElementsByClassName("historyElement")[0].cloneNode(true);

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
        else if (!overviewPopulated) populateOverview();
    }
    document.getElementById("detailsButton").onclick = function () {
        toggleSectionVisibility(detailsSection);
        if (!populationData) fetchPopulationData();
        if (!employmentData) fetchEmploymentData();
        if (!educationData) fetchEducationData();
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
    populationData = new SharedDataset("http://wildboy.uib.no/~tpe056/folk/104857.json");
    populationData.onload = onloadFunction;
    populationData.load();
}

function fetchEmploymentData(onloadFunction) {
    employmentData = new SharedDataset("http://wildboy.uib.no/~tpe056/folk/100145.json");
    employmentData.onload = onloadFunction;
    employmentData.load();
}

function fetchEducationData(onloadFunction) {
    educationData = new EduDataset("http://wildboy.uib.no/~tpe056/folk/85432.json");
    educationData.onload = onloadFunction;
    educationData.load();
}

/**
 * Shows a given section and hides all the other ones defined in "sectionList"
 * @param targetSection section-element which should become visible
 */
function toggleSectionVisibility(targetSection) {
    targetSection.classList.remove("hiddenSection");
    for (let id in sectionList) {
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
    overviewPopulated = true;
}

function populateDetails() {
    // TODO: Throw error if disctrictId is NaN || Not available    
    let disctrictId = document.getElementById("detailsNumInput").value;
    let disPopulationData = populationData.getInfo(disctrictId);
    let disEmploymentData = employmentData.getInfo(disctrictId);
    let disEducationData = educationData.getInfo(disctrictId);

    // LATEST DETAILS SECTION
    document.getElementById("dName").innerText = disPopulationData.name;
    document.getElementById("dNum").innerText = disctrictId;
    document.getElementById("dPopulation").innerText = "(2018) " + (disPopulationData.menLatest() + disPopulationData.womenLatest());

    // Calculate employment numbers
    let empPercentMen = disEmploymentData.menLatest();
    let empPercentWomen = disEmploymentData.womenLatest();
    let menEmpCount = Math.floor((disPopulationData.menLatest() / 100) * empPercentMen);
    let womenEmpCount = Math.floor((disPopulationData.womenLatest() / 100) * empPercentWomen);
    document.getElementById("dEmploy").innerText = "(2018) Menn: " + menEmpCount + " / " + empPercentMen + "%\n" 
                                                 + "(2018) Kvinner: " + womenEmpCount + " / " + empPercentWomen + "%";

    // Calculate according to population of 2017 since education dataset ranges from 1970 - 2017
    let eduPercentMen = disEducationData.higherShort.menForYear(2017);
    let eduPercentWomen = disEducationData.higherShort.womenForYear(2017);
    let menEduCount = Math.floor((disPopulationData.menForYear(2017) / 100) * eduPercentMen);
    let womenEduCount = Math.floor((disPopulationData.womenForYear(2017) / 100) * eduPercentWomen);
    document.getElementById("dEducate").innerText = "(2017) Menn: " + menEduCount + " / " + eduPercentMen + "%\n" 
                                                  + "(2017) Kvinner: " + womenEduCount + " / " + eduPercentWomen + "%";

    // HISTORY SECTION
    // Remove all history-elements if a new search takes place
    while (historyContainer.hasChildNodes()) { historyContainer.removeChild(historyContainer.lastChild); }

    yearIntersection.forEach(year => {
        let populationMen = disPopulationData.menForYear(year);
        let populationWomen = disPopulationData.womenForYear(year);
        
        let empPercentMen = disEmploymentData.menForYear(year);
        let empPercentWomen = disEmploymentData.womenForYear(year);
        let empCountMen = Math.floor((populationMen / 100) * empPercentMen);
        let empCountWomen = Math.floor((populationWomen / 100) * empPercentWomen);

        let eduPercentMen = disEducationData.higherShort.menForYear(year);
        let eduPercentWomen = disEducationData.higherShort.womenForYear(year);
        let eduCountMen = Math.floor((populationMen / 100) * eduPercentMen);
        let eduCountWomen = Math.floor((populationWomen / 100) * eduPercentWomen);

        let newHistory = historyElementTemplate.cloneNode(true);
        newHistory.querySelector("#histYear").innerText = year;
        newHistory.querySelector("#popMen").innerText = populationMen;
        newHistory.querySelector("#popWomen").innerText = populationWomen;
        newHistory.querySelector("#empMen").innerText = empCountMen + " / " + empPercentMen;
        newHistory.querySelector("#empWomen").innerText = empCountWomen + " / " + empPercentWomen;
        newHistory.querySelector("#eduMen").innerText = eduCountMen + " / " + eduPercentMen;
        newHistory.querySelector("#eduWomen").innerText = eduCountWomen + " / " + eduPercentWomen;
        historyContainer.appendChild(newHistory);
    });
}