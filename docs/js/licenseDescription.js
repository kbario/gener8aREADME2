const licenseDescriptionEl = document.getElementById("license-description-div");

licenseDescriptionEl.addEventListener("click", () => {
  licenseDescriptionEl.children[0].children[1].classList.toggle("-rotate-90");
  licenseDescriptionEl.children[1].classList.toggle("hidden");
});
