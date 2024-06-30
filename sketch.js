let numRows = 12;
let numDotsPerRow = 20;
let dotSize = 5;
let spacing = 23;
let totalDots = numRows * numDotsPerRow;
let dotStates; // 0: black, 1: red, 2: disappeared

let mic;
let recognition;
let isListening = false;
let timeoutDuration = 4 * 60 * 1000; // 4 minutes in milliseconds

let img;
let blurIntensitySlider; // Slider for controlling blur intensity
let dotSizeSlider; // Slider for controlling dot size
let skipButton; // Button to clear remaining black dots
let saveButton; // Button to save a PNG copy of the sketch
let showMessage = false; // Flag to control the display of the message

let startTime; // Variable to track the start time of the sketch

function preload() {
  img = loadImage("MOSHE.svg");
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Adjust canvas size if needed to accommodate the sliders and button
  frameRate(1); // 1 frame per second
  dotStates = Array.from({ length: numRows }, () =>
    Array(numDotsPerRow).fill(0)
  );

  mic = new p5.AudioIn();
  mic.start();

  recognition = new webkitSpeechRecognition(); // Initialize speech recognition
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-US"; // Set language to English (United States)
  recognition.onresult = gotSpeech;
  recognition.start();

  // Keep the microphone active for 4 minutes
  setTimeout(function () {
    recognition.stop();
    console.log("Speech recognition stopped after 4 minutes.");
  }, timeoutDuration);

  // Create slider for blur intensity
  blurIntensitySlider = createSlider(0, 30, 25); // Range from 0 (no blur) to 50
  // Create slider for dot size
  dotSizeSlider = createSlider(5, 150, 50); // Range from 5 to 150 pixels
  // Create skip button
  skipButton = createButton("Skip to end of class");
  skipButton.mousePressed(clearBlackDots); // Attach mousePressed event handler

  startTime = millis(); // Record the start time of the sketch

  // Create save button (hidden initially)
  saveButton = createButton("Save Sketch");
  saveButton.mousePressed(saveSketch);
  saveButton.hide();

  positionControls(); // Position the sliders and button
}

function draw() {
  background(220); // Clear the background

  let centerX = width / 2;
  let centerY = height / 2;
  let totalWidth = (numDotsPerRow - 1) * spacing + dotSize;
  let totalHeight = (numRows - 1) * spacing + dotSize;
  let offsetX = centerX - totalWidth / 2;
  let offsetY = centerY - totalHeight / 2;


  noStroke();
  fill(255);
  rect(centerX - 232.5, centerY - 145, 485, 300);

   textAlign(CENTER, CENTER);
    textFont("Monofett");
    textSize(30);
    fill(50);// Grayish Black color for the text
  text("Class 02.07.24 - MOSHE CountDown",width / 2 +10 , height / 2 -165 )
  
  let elapsedTime = millis() - startTime; // Calculate the elapsed time
  let elapsedDots = Math.floor(elapsedTime / 1000); // Convert elapsed time to dots (1 dot per second)
  let dotsToShow = totalDots - elapsedDots;

  // Get values from sliders
  let blurIntensity = blurIntensitySlider.value();
  let pinkDotSize = dotSizeSlider.value();

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numDotsPerRow; col++) {
      let dotIndex = row * numDotsPerRow + col;

      if (dotIndex < dotsToShow && dotStates[row][col] === 0) {
        // Black dots
        let regDotColor = 230;
        fill(regDotColor);
        noStroke();
        let x = col * spacing + spacing / 2 + offsetX;
        let y = row * spacing + spacing / 2 + offsetY;
        ellipse(x, y, dotSize, dotSize);
      } else if (dotStates[row][col] === 1) {
        // Pinkish purple dots with blurred edge
        let pinkPurpleColor = color(220, 130, 250); // Adjust RGB values for pinkish purple
        fill(pinkPurpleColor);
        noStroke();
        let x = col * spacing + spacing / 2 + offsetX;
        let y = row * spacing + spacing / 2 + offsetY;
        let dotRadius = pinkDotSize / 2;
        // Draw a blurred edge using translucent ellipses
        for (let r = dotRadius; r > 0; r -= 2) {
          let alpha = map(r, dotRadius, 0, blurIntensity, 0); // Adjust alpha for gradient effect
          pinkPurpleColor.setAlpha(alpha);
          fill(pinkPurpleColor);
          ellipse(x, y, r * 2, r * 2);
        }
      }
    }
  }

  if (elapsedDots >= totalDots) {
    noLoop(); // Stop the draw loop after all dots disappear
  }

  if (showMessage) {
    imageMode(CENTER);
    image(img, centerX, centerY, 400, 184);
  }
}

function gotSpeech(event) {
  let transcript = event.results[
    event.results.length - 1
  ][0].transcript.toLowerCase();
  console.log("You said: " + transcript);

  if (
    transcript.includes("moshe") ||
    transcript.includes("moshi") ||
    transcript.includes("motion") ||
    transcript.includes("mushy") ||
    transcript.includes("moisture") ||
    transcript.includes("marsha") ||
    transcript.includes("michelle")
  ) {
    triggerRedDot();
  }
}

function triggerRedDot() {
  let elapsedTime = millis() - startTime; // Calculate the elapsed time
  let elapsedDots = Math.floor(elapsedTime / 1000); // Convert elapsed time to dots (1 dot per second)
  let dotsToShow = totalDots - elapsedDots;
  let currentDotIndex = dotsToShow - 1;

  if (currentDotIndex >= 0) {
    let row = Math.floor(currentDotIndex / numDotsPerRow);
    let col = currentDotIndex % numDotsPerRow;
    if (dotStates[row][col] === 0) {
      dotStates[row][col] = 1; // Change the dot state to red
    }
  }
}

function clearBlackDots() {
  let elapsedTime = millis() - startTime; // Calculate the elapsed time
  let elapsedDots = Math.floor(elapsedTime / 1000); // Convert elapsed time to dots (1 dot per second)
  let dotsToShow = totalDots - elapsedDots;

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numDotsPerRow; col++) {
      let dotIndex = row * numDotsPerRow + col;

      if (dotIndex < dotsToShow && dotStates[row][col] === 0) {
        dotStates[row][col] = 2; // Set remaining black dot state to disappeared
      }
    }
  }

  // Set flag to show the message
  showMessage = true;
  

  // Hide sliders and skip button, show save button
  blurIntensitySlider.hide();
  dotSizeSlider.hide();
  skipButton.hide();
  saveButton.show();
  

  positionSaveButton(); // Position the save button
}

function saveSketch() {
  saveCanvas('mySketch', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionControls(); // Reposition the sliders and button
  positionSaveButton(); // Reposition the save button
}

function positionControls() {
  let centerX = windowWidth / 2;
  let controlY = height - 50;

  // Calculate the total width of the sliders and button
  let totalWidth =
    blurIntensitySlider.width + dotSizeSlider.width + skipButton.width + 40;

  let offsetX = centerX - totalWidth / 2;

  blurIntensitySlider.position(offsetX, controlY);
  dotSizeSlider.position(offsetX + blurIntensitySlider.width + 10, controlY);
  skipButton.position(
    offsetX + blurIntensitySlider.width + dotSizeSlider.width + 20,
    controlY
  );
}

function positionSaveButton() {
  let centerX = windowWidth / 2;
  let controlY = height - 50;
  saveButton.position(centerX - saveButton.width / 2, controlY);
}
