// Define all 4 sections on global variables and put the in a list
let introSection = document.getElementById("introduction");
let overviewSection = document.getElementById("overview");
let detailsSection = document.getElementById("details");
let comparisonSection = document.getElementById("comparison");
let sectionList = [introSection, overviewSection, detailsSection, comparisonSection];

// Variables which will contain the different datasets after they have been loaded
let populationData, employmentData, educationData;
let overviewPopulated = false;

// Fetch DOM elements to use as a templates for history-elements in the details and comparison views
let detailHistoryContainer = document.getElementById("detailsHistory");
let compareHistoryContainer = document.getElementById("compareHistory");
let detailElementTemplate = detailHistoryContainer.getElementsByClassName("historyElement")[0].cloneNode(true);
let compareElementTemplate = compareHistoryContainer.getElementsByClassName("historyElement")[0].cloneNode(true);

// Constant to work as enum for easier url-access
const FetchType = {
    "population": "http://wildboy.uib.no/~tpe056/folk/104857.json",
    "employment": "http://wildboy.uib.no/~tpe056/folk/100145.json",
    "education": "http://wildboy.uib.no/~tpe056/folk/85432.json"
};

/**
 * Sets the initial condition for the application
 *  1. Add eventlisteners where needed which fetch datasets and handles searches
 *  2. Hide all sections except the introduction
 */
function init() {
    document.getElementById("introButton").onclick = function () {
        toggleSectionVisibility(introSection);
    }
    document.getElementById("overviewButton").onclick = function () {
        toggleSectionVisibility(overviewSection);
        if (!populationData) populationData = fetchStatisticalData(FetchType.population, CommonDataset, populateOverview);
        else if (!overviewPopulated) populateOverview();
    }
    document.getElementById("detailsButton").onclick = function () {
        toggleSectionVisibility(detailsSection);
        if (!populationData) populationData = fetchStatisticalData(FetchType.population, CommonDataset);
        if (!employmentData) employmentData = fetchStatisticalData(FetchType.employment, CommonDataset);
        if (!educationData) educationData = fetchStatisticalData(FetchType.education, EduDataset);
    }
    document.getElementById("comparisonButton").onclick = function () {
        toggleSectionVisibility(comparisonSection);
        if (!employmentData) educationData = fetchStatisticalData(FetchType.education, EduDataset);
    }

    // Both events check that the required data has loaded before trying to execute after button-click
    document.getElementById("detailsSubmit").onclick = function() {
        if (populationData && employmentData && educationData) handleDetailsSearch();
    }
    document.getElementById("compareSubmit").onclick = function() {
        if (employmentData) handleComparisonSearch();
    }

    overviewSection.classList.toggle("hiddenSection");
    detailsSection.classList.toggle("hiddenSection");
    comparisonSection.classList.toggle("hiddenSection");
}

/**
 * Creates a new Dataset (based on constructor) with the url from the url-parameter,
 * then sets the onload-function and then calls load() on the new object.
 * @param url resource that should be passed to the datasetConstructor
 * @param datasetContructor specifies which type of object to create
 * @param onloadFunction function to be set as the onload-function for the new Dataset-object
 * @returns a new Dataset-object
 */
function fetchStatisticalData(url, datasetContructor, onloadFunction) {
    let dataset = new datasetContructor(url);
    dataset.onload = onloadFunction;
    dataset.load();
    return dataset;
}

/**
 * Shows a given section and hides all the other ones defined in the global "sectionList"-variable.
 * @param targetSection section-element which should become visible
 */
function toggleSectionVisibility(targetSection) {
    targetSection.classList.remove("hiddenSection");
    sectionList.forEach(section => {
        if (section !== targetSection) section.classList.add("hiddenSection");
    });
}

/**
 * Populates the overview-view of the application with data
 * from the dataset object defined on the "populationData" variable.
 */
function populateOverview() {
    let overviewTbody = document.getElementById("overviewBody");
    let districtIds = populationData.getIds();

    // Fetches data from all the district-ids available and populates a table with this information
    districtIds.forEach(districtId => {
        let idElement = document.createElement("td");
        let nameElement = document.createElement("td");
        let populationElement = document.createElement("td");

        let info = populationData.getInfo(districtId);
        nameElement.innerText = info.name;
        idElement.innerText = districtId;
        populationElement.innerText = info.menLatest() + info.womenLatest();

        let tableRow = document.createElement("tr");
        tableRow.appendChild(nameElement);
        tableRow.appendChild(idElement);
        tableRow.appendChild(populationElement);
        overviewTbody.appendChild(tableRow);
    });
    overviewPopulated = true;
}

/**
 * Handles the search in the details-view of the application and makes the appropriate calls
 * to populate the view with data from the dataset objects defined on the
 * populationData, employmentData and educationData variables.
 */
function handleDetailsSearch() {
    let districtId = document.getElementById("detailsNumInput").value;
    let disPopulationData = populationData.getInfo(districtId);
    let disEmploymentData = employmentData.getInfo(districtId);
    let disEducationData = educationData.getInfo(districtId);

    // Error-handling if one of the data-lookups end up as undefined
    if (!disPopulationData || !disEmploymentData || !disEducationData) {
        document.getElementById("detailsError").innerText = "Kommune-nummer ikke gyldig";
        return;
    } else {
        document.getElementById("detailsError").innerText = "";
    }

    // Populate the two sections contained within the details-view with data from the search
    populateRecentDetails(disPopulationData, disEmploymentData, disEducationData, districtId);
    populateDetailsHistory(disPopulationData, disEmploymentData, disEducationData);
}

/**
 * Populates the recent details section of the details-view after a search takes place
 * @param disPopulationData population-data belonging to the given districtId
 * @param disEmploymentData employment-data belonging to the given districtId
 * @param disEducationData education-data belonging to the given districtId
 * @param districtId id belonging to the target district of the search
 */
function populateRecentDetails(disPopulationData, disEmploymentData, disEducationData, districtId) {
    document.getElementById("dName").innerText = disPopulationData.name;
    document.getElementById("dNum").innerText = districtId;
    document.getElementById("dPopulation").innerText = (disPopulationData.menLatest() + disPopulationData.womenLatest());

    // Calculate employment numbers
    let empPercentMen = disEmploymentData.menLatest();
    let empPercentWomen = disEmploymentData.womenLatest();
    let menEmpCount = Math.floor((disPopulationData.menLatest() / 100) * empPercentMen);
    let womenEmpCount = Math.floor((disPopulationData.womenLatest() / 100) * empPercentWomen);
    document.getElementById("dEmploy").innerText = "\nMenn: " + menEmpCount + " / " + empPercentMen + "%\n" 
                                                 + "Kvinner: " + womenEmpCount + " / " + empPercentWomen + "%";

    // Calculations according to population of 2017 since education dataset ranges from 1970 - 2017
    let eduPercentMen = disEducationData.higherShort.menForYear(2017);
    let eduPercentWomen = disEducationData.higherShort.womenForYear(2017);
    let menEduCount = Math.floor((disPopulationData.menForYear(2017) / 100) * eduPercentMen);
    let womenEduCount = Math.floor((disPopulationData.womenForYear(2017) / 100) * eduPercentWomen);
    document.getElementById("dEducate").innerText = "\nMenn: " + menEduCount + " / " + eduPercentMen + "%\n" 
                                                  + "Kvinner: " + womenEduCount + " / " + eduPercentWomen + "%";
}

/**
 * Populates the history section of the details-view after a search takes place
 * @param disPopulationData population-data belonging to the given districtId
 * @param disEmploymentData employment-data belonging to the given districtId
 * @param disEducationData education-data belonging to the given districtId
 */
function populateDetailsHistory(disPopulationData, disEmploymentData, disEducationData) {
    // Remove all old history-elements if a new search takes place
    while (detailHistoryContainer.hasChildNodes()) { detailHistoryContainer.removeChild(detailHistoryContainer.lastChild); }
    
    // Loops over data on intersection of years available to all datasets: 2007 - 2017
    for (let year = 2007; year <= 2017; year++) {
        let populationMen = disPopulationData.menForYear(year);
        let populationWomen = disPopulationData.womenForYear(year);
        
        let empPercentMen = disEmploymentData.menForYear(year);
        let empPercentWomen = disEmploymentData.womenForYear(year);
        let empCountMen = Math.floor((populationMen / 100) * empPercentMen);
        let empCountWomen = Math.floor((populationWomen / 100) * empPercentWomen);

        // Creates a new "history-block" from a "template" fetched from the DOM
        // Feeds data to the elements within this block
        let detailBlock = detailElementTemplate.cloneNode(true);
        detailBlock.querySelector(".histYear").innerText = year;
        detailBlock.querySelector(".popMen").innerText = populationMen;
        detailBlock.querySelector(".empMen").innerText = empCountMen + " / " + empPercentMen;
        detailBlock.querySelector(".popWomen").innerText = populationWomen;
        detailBlock.querySelector(".empWomen").innerText = empCountWomen + " / " + empPercentWomen;

        for (let educationLevel in disEducationData) {
            let statistics = calculateEducationNumbers(year, populationMen, populationWomen, disEducationData[educationLevel]);
            detailBlock.querySelector("." + educationLevel + "Men").innerText = statistics.countMen + " / " + statistics.percentMen;
            detailBlock.querySelector("." + educationLevel + "Women").innerText = statistics.countWomen + " / " + statistics.percentWomen;
        }
        
        detailHistoryContainer.appendChild(detailBlock);
    }
}

/**
 * Find and calculates statistical data for a given educationLevel-object
 * (see object creation in EduDatasets's parseContent()-method)
 * @param year what year to fetch information for
 * @param populationMen population of the given year for men
 * @param populationWomen population of the given year for women
 * @param eduInfo the educationLevel-object to look up information in
 */
function calculateEducationNumbers(year, populationMen, populationWomen, eduInfo) {
    let percentMen = eduInfo.menForYear(year);
    let percentWomen = eduInfo.womenForYear(year);
    let countMen = Math.floor((populationMen / 100) * percentMen);
    let countWomen = Math.floor((populationWomen / 100) * percentWomen);
    return {"percentMen": percentMen, "percentWomen": percentWomen, "countMen": countMen, "countWomen": countWomen};
}

/**
 * Handles the search in the comparison-view of the application and makes the appropriate calls
 * to populate the view with data from the dataset object defined on the employmentData variable.
 */
function handleComparisonSearch() {
    let firstId = document.getElementById("compareNumInputOne").value;
    let secondId = document.getElementById("compareNumInputTwo").value;
    let firstDistrict = employmentData.getInfo(firstId);
    let secondDistrict = employmentData.getInfo(secondId);

    // Display error to user if one of the data-lookups end up as undefined
    if (!firstDistrict) {
        document.getElementById("compareError").innerText = "Første kommune-nummer ikke gyldig";
        return;
    } else if (!secondDistrict) {
        document.getElementById("compareError").innerText = "Andre kommune-nummer ikke gyldig"; 
        return;
    } else {
        document.getElementById("compareError").innerText = "";
    }

    // Populate the section contained within the comparison-view with data from the search
    populateComparisonHistory(firstDistrict, secondDistrict);
}

/**
 * Populates the history section of the comparison-view after a search takes place
 * @param firstDistrict employment-data belonging to the first districtId of the search
 * @param secondDistrict employment-data belonging to the second districtId of the search
 */
function populateComparisonHistory(firstDistrict, secondDistrict) {
    // Remove all history-elements if a new search takes place
    while (compareHistoryContainer.hasChildNodes()) { compareHistoryContainer.removeChild(compareHistoryContainer.lastChild); }

    for (let year = 2005; year <= 2018; year++) {
        let empPercentMenFirst = firstDistrict.menForYear(year);
        let empPercentMenSecond = secondDistrict.menForYear(year);
        let empPercentWomenFirst = firstDistrict.womenForYear(year);
        let empPercentWomenSecond = secondDistrict.womenForYear(year);

        // Creates a new "history-block" from a "template" fetched from the DOM
        // Feeds data to the elements within this block
        let compareBlock = compareElementTemplate.cloneNode(true);
        compareBlock.querySelector(".compareYear").innerText = year;
        compareBlock.querySelector(".districtOne").innerText = firstDistrict.name;
        compareBlock.querySelector(".districtTwo").innerText = secondDistrict.name;
        compareBlock.querySelector(".empWomenOne").innerText = empPercentWomenFirst;
        compareBlock.querySelector(".empWomenTwo").innerText = empPercentWomenSecond;
        compareBlock.querySelector(".empMenOne").innerText = empPercentMenFirst;
        compareBlock.querySelector(".empMenTwo").innerText = empPercentMenSecond;
        compareHistoryContainer.appendChild(compareBlock);

        // Calculates percentage points and marks the correct DOM-elements by adding classes for css
        // Skips comparison if displaying first year (no earlier statistics)
        if (year != 2005) {
            let changePointsMenFirst =  empPercentMenFirst - firstDistrict.menForYear(year - 1);
            let changePointsMenSecond = empPercentMenSecond - secondDistrict.menForYear(year - 1);
            let changePointsWomenFirst = empPercentWomenFirst - firstDistrict.womenForYear(year - 1);
            let changePointsWomenSecond = empPercentWomenSecond - secondDistrict.womenForYear(year - 1);
            let changePointsDistrictOne = changePointsMenFirst + changePointsMenSecond;
            let changePointsDistrictTwo = changePointsWomenFirst + changePointsWomenSecond;

            changePointsMenFirst > changePointsMenSecond ? compareBlock.querySelector(".empMenOne").classList.add("blueBoldText")
                                                         : compareBlock.querySelector(".empMenTwo").classList.add("blueBoldText");
            changePointsWomenFirst > changePointsWomenSecond ? compareBlock.querySelector(".empWomenOne").classList.add("redBoldText")
                                                             : compareBlock.querySelector(".empWomenTwo").classList.add("redBoldText");
            changePointsDistrictOne > changePointsDistrictTwo ? compareBlock.querySelector(".districtOne").classList.add("greenBoldText")
                                                              : compareBlock.querySelector(".districtTwo").classList.add("greenBoldText");
        }
    }
}