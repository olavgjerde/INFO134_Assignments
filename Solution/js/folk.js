let informationSection = document.getElementById("information");
let overviewSection = document.getElementById("overview");
let detailsSection = document.getElementById("details");
let comparisonSection = document.getElementById("comparison");

let infoNavButton = document.getElementById("infoButton");
let detailsNavButton = document.getElementById("detailsButton");
let overviewNavButton = document.getElementById("overviewButton");
let comparisonNavButton = document.getElementById("comparisonButton");

let sectionList = [informationSection, overviewSection, detailsSection, comparisonSection];

function toggleSection(targetSection, currentSection) {
  targetSection.classList.toggle("hideSection");
  currentSection.classList.toggle("hideSection");
}