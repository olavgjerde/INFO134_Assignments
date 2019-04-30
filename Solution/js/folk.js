let introSection = document.getElementById("introduction");
let overviewSection = document.getElementById("overview");
let detailsSection = document.getElementById("details");
let comparisonSection = document.getElementById("comparison");
let sectionList = [introSection, overviewSection, detailsSection, comparisonSection];

let populationData, employmentData, educationData;
let overviewPopulated = false;

// Fetch DOM element to use as a template for history-elements, for details and comparison section
let detailHistoryContainer = document.getElementById("detailsHistory");
let compareHistoryContainer = document.getElementById("compareHistory");
let detailElementTemplate = detailHistoryContainer.getElementsByClassName("historyElement")[0].cloneNode(true);
let compareElementTemplate = compareHistoryContainer.getElementsByClassName("historyElement")[0].cloneNode(true);

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
    document.getElementById("compareSubmit").onclick = populateComparison;

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
    let disctrictId = document.getElementById("detailsNumInput").value;
    let disPopulationData = populationData.getInfo(disctrictId);
    let disEmploymentData = employmentData.getInfo(disctrictId);
    let disEducationData = educationData.getInfo(disctrictId);

    // Error-handling for districtId inputs
    if (!disPopulationData || !disEmploymentData || !disEducationData) {
        document.getElementById("detailsError").innerText = "Kommune-nummer ikke gyldig";
        return;
    } else {
        document.getElementById("detailsError").innerText = "";
    }

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
    while (detailHistoryContainer.hasChildNodes()) { detailHistoryContainer.removeChild(detailHistoryContainer.lastChild); }
    
    // Loops over data on intersection of years available to all datasets: 2007 - 2017
    for (let year = 2007; year <= 2017; year++) {
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

        let detailBlock = detailElementTemplate.cloneNode(true);
        detailBlock.querySelector("#histYear").innerText = year;
        detailBlock.querySelector("#popMen").innerText = populationMen;
        detailBlock.querySelector("#popWomen").innerText = populationWomen;
        detailBlock.querySelector("#empMen").innerText = empCountMen + " / " + empPercentMen;
        detailBlock.querySelector("#empWomen").innerText = empCountWomen + " / " + empPercentWomen;
        detailBlock.querySelector("#eduMen").innerText = eduCountMen + " / " + eduPercentMen;
        detailBlock.querySelector("#eduWomen").innerText = eduCountWomen + " / " + eduPercentWomen;
        detailHistoryContainer.appendChild(detailBlock);
    }
}

function populateComparison() {
    let firstId = document.getElementById("compareNumInputOne").value;
    let secondId = document.getElementById("compareNumInputTwo").value;
    let firstDistrict = employmentData.getInfo(firstId);
    let secondDistrict = employmentData.getInfo(secondId);

    // Error-handling for districtId inputs
    if (!firstDistrict) {
        document.getElementById("compareError").innerText = "Første kommune-nummer ikke gyldig";
        return;
    } else if (!secondDistrict) {
        document.getElementById("compareError").innerText = "Andre kommune-nummer ikke gyldig"; 
        return;
    } else {
        document.getElementById("compareError").innerText = "";
    }

    // Remove all history-elements if a new search takes place
    while (compareHistoryContainer.hasChildNodes()) { compareHistoryContainer.removeChild(compareHistoryContainer.lastChild); }

    for (let year = 2005; year <= 2018; year++) {
        let eduPercentMenFirst = firstDistrict.menForYear(year);
        let eduPercentMenSecond = secondDistrict.menForYear(year);
        let eduPercentWomenFirst = firstDistrict.womenForYear(year);
        let eduPercentWomenSecond = secondDistrict.womenForYear(year);

        let compareBlock = compareElementTemplate.cloneNode(true);
        compareBlock.querySelector("#compareYear").innerText = year;
        compareBlock.querySelector("#districtOne").innerText = firstDistrict.name;
        compareBlock.querySelector("#districtTwo").innerText = secondDistrict.name;
        compareBlock.querySelector("#eduMenOne").innerText = eduPercentMenFirst;
        compareBlock.querySelector("#eduMenTwo").innerText = eduPercentMenSecond;
        compareBlock.querySelector("#eduWomenOne").innerText = eduPercentWomenFirst;
        compareBlock.querySelector("#eduWomenTwo").innerText = eduPercentWomenSecond;
        compareHistoryContainer.appendChild(compareBlock);

        // Skip comparison if displaying first year (no earlier statistics)
        if (year != 2005) {
            let changePointsMenFirst =  eduPercentMenFirst - firstDistrict.menForYear(year - 1);
            let changePointsMenSecond = eduPercentMenSecond - secondDistrict.menForYear(year - 1);
            let changePointsWomenFirst = eduPercentWomenFirst - firstDistrict.womenForYear(year - 1);
            let changePointsWomenSecond = eduPercentWomenSecond - secondDistrict.womenForYear(year - 1);
            let changePointsDistrictOne = changePointsMenFirst + changePointsMenSecond;
            let changePointsDistrictTwo = changePointsWomenFirst + changePointsWomenSecond;

            changePointsMenFirst > changePointsMenSecond ? compareBlock.querySelector("#eduMenOne").classList.add("blueBoldText")
                                                         : compareBlock.querySelector("#eduMenTwo").classList.add("blueBoldText");
            changePointsWomenFirst > changePointsWomenSecond ? compareBlock.querySelector("#eduWomenOne").classList.add("redBoldText")
                                                             : compareBlock.querySelector("#eduWomenTwo").classList.add("redBoldText");
            changePointsDistrictOne > changePointsDistrictTwo ? compareBlock.querySelector("#districtOne").classList.add("greenBoldText")
                                                              : compareBlock.querySelector("#districtTwo").classList.add("greenBoldText");
        }
    }
}