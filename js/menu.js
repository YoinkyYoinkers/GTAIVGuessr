// Generate random background image
document.body.style.backgroundImage = `url("images/locations/${GetRandomNumber()}.jpg")`; 

// Dynamically update round slider value.
var roundSlider = document.getElementById("round-amount");
var roundOutput = document.getElementById("round-value");
roundOutput.innerHTML = roundSlider.value;

roundSlider.oninput = function() {
  roundOutput.innerHTML = this.value;
}
