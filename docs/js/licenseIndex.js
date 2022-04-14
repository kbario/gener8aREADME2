// global vars
const licenseEl = document.getElementById("license-select");
const licenseDescriptionEl = document.getElementById("license-description-div");
const licenseDescription = document.getElementById("license-description");
const licenseNameInput = document.getElementById("license-name-input");

let pickedLicense;

// get a single license using license name
async function getLicense(lic) {
  const licenseData = await fetch(`https://api.github.com/licenses/${lic}`);
  const license = await licenseData.json();
  return license;
}

// get all open source licenses
async function getAllLicenses() {
  const localLicenses = JSON.parse(localStorage.getItem("licenses")) || "";
  if (localLicenses === "") {
    const licensesData = await fetch(`https://api.github.com/licenses`);
    const licenses = await licensesData.json();
    localStorage.setItem("licenses", JSON.stringify(licenses));
    return licenses;
  } else {
    return localLicenses;
  }
}

// creating and setting the class for a label element to hold a radio button
function createOptionEl(license) {
  const option = document.createElement("option");
  option.innerHTML = license;
  option.setAttribute("value", license);
  if (license === "MIT") {
    option.setAttribute("selected", "selected");
  }
  return option;
}

// create option html elements and append them to the license select form
function createAndAppendOptions(license) {
  const option = createOptionEl(license);
  licenseEl.appendChild(option);
}

// get the license selected in ui
async function getSelectedLicense() {
  const license = await getLicense(licenseEl.value);
  return license;
}

function checkIfNamesSectionIsRequired(body) {
  const fullname = /\[fullname\]/gi;
  if (/\[fullname\]/gi.test(body)) {
    console.log(body.search(fullname));
    console.log("yes");
    licenseNameInput.classList.remove("hidden");
    licenseNameInput.classList.add("flex");
  } else {
    licenseNameInput.classList.add("hidden");
    licenseNameInput.classList.remove("flex");
  }
}

async function syncLicenseSection() {
  pickedLicense = await getSelectedLicense();
  console.log(pickedLicense);
  licenseDescription.innerHTML = pickedLicense.description;
  checkIfNamesSectionIsRequired(pickedLicense.body);
}

function createLicenseInputs() {}

// running the ui

async function init() {
  const allLicenses = await getAllLicenses();
  allLicenses.forEach((element) => {
    createAndAppendOptions(element.spdx_id);
  });
  syncLicenseSection();
}

init();

licenseEl.addEventListener("change", syncLicenseSection);

// const imps = await Promise.all(
//   allLicenses.map(async (item) => {
//     const result = await fetch(item.url);
//     const data = await result.json();
//     return data;
//   })
// );

// console.log(imps);

// FUNCTIONS TO CREATE LICENSE FILE

// takes the implementation data from the license data retrieved from github license api
// checks if either license, copying or unlicense is present with license implementation instructions
// returns a title for the file depending on phrases present
function findFileName() {
  if (/COPYING/.test(implementation)) {
    return "COPYING";
  } else if (/ LICENSE.txt/.test(implementation)) {
    return "LICENSE.txt";
  } else if (/ UNLICENSE.txt/.test(implementation)) {
    return "UNLICENSE.txt";
  }
}

// takes the body of the license data retrived from github license api
// checks to see if both [year] and [fullname] are present within the body
// changes the year to current year and the fullname to name parsed from ui
// returns license with
function changeBracketText(body, name) {
  if (/\[year\]/.test(body) && /\[fullname\]/.test(body)) {
    const newbody = body
      .replace("[year]", new Date().getFullYear())
      .replace("[fullname]", "Kyle Bario"); // TODO: change Kyle Bario to implement the name arg and implement function to convert array of names if supplied into a string
    return newbody;
  }
  return body;
}

// utilises functions above
// creates a blob object to download the made file
function createDownloadableLicense(licenseData) {
  const fileName = findFileName(licenseData.implementation);
  const licenseBody = changeBracketText(licenseData.body);

  const file = new Blob([licenseBody], {
    type: "text/plain",
    endings: "native",
  });

  const fileURL = URL.createObjectURL(file);

  // create the link
  const linkElement = document.createElement("a");

  // add the file url
  linkElement.setAttribute("href", fileURL);
  linkElement.setAttribute("class", "w-5 h-5 bg-blue-200");

  // add the download attribute with name suggestion
  linkElement.setAttribute("download", fileName);

  // add it to the DOM
  const nave = document.getElementsByTagName("nav")[0];
  nave.appendChild(linkElement);
}
