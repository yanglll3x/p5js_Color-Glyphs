
if (typeof defaultMode === 'undefined') {
  var defaultMode = "sketch";
}

if (typeof defaultSize === 'undefined') {
  var defaultSize = "128";
}

if (typeof defaultDisplay === 'undefined') {
  var defaultDisplay = "both";
}

if (typeof defaultEmoji === 'undefined') {
  var defaultDisplay = 76;
}

if (typeof backgroundColor === 'undefined') {
  var backgroundColor = "rgb(232, 232, 232)";
}


let canvasWidth = 960;
let canvasHeight = 500;

let glyphSelector;
let modeSelector;
let sizeSelector;
let show_oddball = false;
let oddball_row = 0;
let oddball_col = 0;

let val_sliders = [];
let max_vals = [360, 100, 100];

let curEmoji = defaultEmoji;
let NUM_EMOJI = 872;
let EMOJI_WIDTH = 38;

let lastKeyPressedTime;
let secondsUntilSwapMode = 10;
let secondsPerEmoji = 5;
let isSwappingEmoji = false;
let emojiSwapLerp = 0;
let prevEmoji = 0;
let lastEmojiSwappedTime;

let emojiImg;
let sketchImg;
let curEmojiImg;
let curEmojiPixels;
let curEmojiColors, nextEmojiColors, prevEmojiColors;
function preload() {
  emojiImg = loadImage("twemoji36b_montage.png");
  sketchImg = loadImage("sketch.png");
}

function setup() {
  // create the drawing canvas, save the canvas element
  let main_canvas = createCanvas(canvasWidth, canvasHeight);
  main_canvas.parent('canvasContainer');

  let now = millis();
  lastKeyPressedTime = now;
  lastEmojiSwappedTime = now;

  // create two sliders
  for (i=0; i<3; i++) {
    let slider = createSlider(0, 10*max_vals[i], 10*max_vals[i]/2);
    slider.parent("slider" + (i+1) + "Container")
    slider.changed(sliderUpdated);
    slider.mouseMoved(sliderUpdated);
    slider.touchMoved(sliderUpdated);
    val_sliders.push(slider);
  }

  modeSelector = createSelect();
  modeSelector.option('sketch');
  modeSelector.option('edit');
  modeSelector.option('random');
  modeSelector.option('gradient');
  modeSelector.option('oddball');
  modeSelector.option('image');
  modeSelector.changed(modeChangedEvent);
  modeSelector.value(defaultMode);
  modeSelector.parent('selector1Container');

  glyphSelector = createSelect();
  glyphSelector.option('color');
  glyphSelector.option('glyph');
  glyphSelector.option('both');
  glyphSelector.value(defaultDisplay);
  glyphSelector.parent('selector2Container');

  sizeSelector = createSelect();
  sizeSelector.option('32');
  sizeSelector.option('64');
  sizeSelector.option('128');
  sizeSelector.parent('selector3Container');
  sizeSelector.value(defaultSize);
  sizeSelector.changed(sizeChangedEvent);


  guideCheckbox = createCheckbox('', false);
  guideCheckbox.parent('checkContainer');
  guideCheckbox.changed(guideChangedEvent);

  button = createButton('redo');
  button.mousePressed(buttonPressedEvent);
  button.parent('buttonContainer');

  curEmojiImg = createImage(36, 36);
  // create an array for HSB values: [18][18][3]
  curEmojiPixels = Array(18);
  curEmojiColors = Array(18);
  for(let i=0; i<18; i++) {
    curEmojiPixels[i] = Array(18);
    curEmojiColors[i] = Array(18);
    for(let j=0; j<18; j++) {
      curEmojiPixels[i][j] = Array(3);
    }
  }

  gray_glyph = new Glyph();
  refreshGridData();
  modeChangedEvent();
}

function sliderUpdated() {
    redraw();
}

function mouseClicked() {
  if (mouseX > width/4) {
    refreshGridData();
  }
  redraw();
}

function dataInterpolate(data1, data2, val) {
  let d = new Array(3);
  for(let i=0; i<3; i++) {
    d[i] = lerp(data1[i], data2[i], val);
  }
  return d;
}

let numGridRows;
let numGridCols;
let gridValues; // row, col order
let gridOffsetX, gridOffsetY;
let gridSpacingX, gridSpacingY;
// Generate data for putting glyphs in a grid

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function refreshGridData() {
  let mode = modeSelector.value();
  let glyphSize = parseInt(sizeSelector.value(), 10);

  if (mode == "image") {
    if(glyphSize == 32) {
      numGridCols = 18;
      numGridRows = 17;
      gridOffsetX = 320;
      gridSpacingX = 31;
      gridOffsetY = 2;
      gridSpacingY = 29;
    }
    else if(glyphSize == 64) {
      numGridCols = 10;
      numGridRows = 9;
      gridOffsetX = 280;
      gridSpacingX = 66;
      gridOffsetY = -18;
      gridSpacingY = 59;
    }
    else if(glyphSize == 128) {
      numGridCols = 6;
      numGridRows = 5;
      gridOffsetX = 164;
      gridSpacingX = 132;
      gridOffsetY = -50;
      gridSpacingY = 118;
    }
    else if(glyphSize == 256) {
      numGridCols = 3;
      numGridRows = 3;
      gridOffsetX = 172;
      gridSpacingX = 262;
      gridOffsetY = -100;
      gridSpacingY = 234;
    }
  }
  else if(glyphSize == 128) {
    numGridCols = 6;
    numGridRows = 3;
    gridOffsetX = 38;
    gridSpacingX = 156;
    gridOffsetY = 32;
    gridSpacingY = 166;
  }
  else if(glyphSize == 256) {
    numGridCols = 3;
    numGridRows = 1;
    gridOffsetX = 20;
    gridSpacingX = 320;
    gridOffsetY = 100;
    gridSpacingY = 500;
  }
  else if(glyphSize == 64) {
    numGridCols = 12;
    numGridRows = 6;
    gridOffsetX = 15;
    gridSpacingX = 78;
    gridOffsetY = 15;
    gridSpacingY = 81;
  }
  else if(glyphSize == 32) {
    numGridCols = 21;
    numGridRows = 11;
    gridOffsetX = 22;
    gridSpacingX = 44;
    gridOffsetY = 22;
    gridSpacingY = 42;
  }
  gridValues = new Array(numGridRows);
  for (let i=0; i<numGridRows; i++) {
    gridValues[i] = new Array(numGridCols);
    for (let j=0; j<numGridCols; j++) {
      gridValues[i][j] = new Array(8);
    }
  }
  if (mode == "gradient" || mode == 'oddball') {
    let top_left = Array(3);
    let top_right = Array(3);
    let bottom_left = Array(3);
    let bottom_right = Array(3);
    for (let k=0; k<3; k++) {
      top_left[k] = random(max_vals[k]);
      top_right[k] = random(max_vals[k]);
      bottom_left[k] = random(max_vals[k]);
      bottom_right[k] = random(max_vals[k]);
    }
    for (let i=0; i<numGridRows; i++) {
      let frac_down = 0;
      if(numGridRows != 1) {
        frac_down = i / (numGridRows - 1.0);
      }
      d_left = dataInterpolate(top_left, bottom_left, frac_down);
      d_right = dataInterpolate(top_right, bottom_right, frac_down);
      for (let j=0; j<numGridCols; j++) {
        let frac_over = 0;
        if(numGridCols != 0) {
          frac_over = j / (numGridCols - 1.0);
        }
        gridValues[i][j] = dataInterpolate(d_left, d_right, frac_over);
      }
    }
    if (mode == 'oddball') {
      // replace an entry at random
      oddball_row = Math.floor(random(numGridRows))
      oddball_col = Math.floor(random(numGridCols))
      for (let k=0; k<3; k++) {
        gridValues[oddball_row][oddball_col][k] = random(max_vals[k]);
      }
    }
  }
  else if(mode == "image") {
    for (let i=0; i<numGridRows; i++) {
      for (let j=0; j<numGridCols; j++) {
        for (let k=0; k<3; k++) {
          gridValues[i][j][k] = curEmojiPixels[i][j][k];
        }
      }
    }
  }
  else {
    for (let i=0; i<numGridRows; i++) {
      for (let j=0; j<numGridCols; j++) {
        for (let k=0; k<3; k++) {
          gridValues[i][j][k] = random(max_vals[k]);
        }
      }
    }
  }
}

function sizeChangedEvent() {
  let mode = modeSelector.value();
  if (mode != 'edit') {
    refreshGridData();
  }
  redraw();
}

function guideChangedEvent() {
  show_oddball = guideCheckbox.checked();
  redraw();
}

function modeChangedEvent() {
  let mode = modeSelector.value();

  // enable/disable sliders
  if (mode === 'edit') {
    // disable the button
    // button.attribute('disabled','');

    // enable the size selector
    sizeSelector.removeAttribute('disabled');

    // enable the first four sliders
    for(let i=0; i<3; i++) {
      val_sliders[i].removeAttribute('disabled');
    }
  }
  else {
    // enable the button
    // button.removeAttribute('disabled');

    // disable the sliders
    for(let i=0; i<3; i++) {
      val_sliders[i].attribute('disabled','');
    }

    // enable the size selector
    // sizeSelector.removeAttribute('disabled');

    // refresh data
    refreshGridData();
  }
  if (mode === "image") {
    // get current emoji image
    let offsetX = 36 * (curEmoji % 38);
    let offsetY = 36 * Math.floor(curEmoji / 38);

    let squareOffsets = [ [0,0], [0,1], [1,1], [1, 0] ];
    curEmojiImg.copy(emojiImg, offsetX, offsetY, 36, 36, 0, 0, 36, 36);
    curEmojiImg.loadPixels();
    for(let i=0; i<17; i++) {
      // i is y
      let maxX = 18;
      let offsetX = 0;
      if (i%2 == 1) {
        maxX = 17;
        offsetX = 1;
      }
      for(let j=0; j<maxX; j++) {
        // j is x
        let sumColor = [0, 0, 0];
        for(let k=0; k<4; k++) {
          // k is summing over 4 adacent pixels
          let curColor = curEmojiImg.get(j*2 + squareOffsets[k][0] + offsetX, 1 + i*2 + squareOffsets[k][1]);
          for(let l=0; l<3; l++) {
            sumColor[l] += curColor[l] / 4.0;
          }
        }
        let curColor = color(sumColor);
        curEmojiColors[i][j] = curColor;
        let rgba = curColor._array;
        let rgb = [ rgba[0], rgba[1], rgba[2] ];
        let hscol = hsluv.rgbToHsluv(rgb);
        curEmojiPixels[i][j][0] = hscol[0];
        curEmojiPixels[i][j][1] = hscol[1];
        curEmojiPixels[i][j][2] = hscol[2];
      }
    }
    // refresh data
    refreshGridData();
  }

  redraw();
}

function buttonPressedEvent() {
  refreshGridData();
  redraw();
}

// function fillHsluv(h, s, l) {
//   var rgb = hsluv.hsluvToRgb([h, s, l]);
//   fill(rgb[0] * 255, rgb[1] * 255, rgb[2] * 255);
// }

function ColorGlyph() {
  this.draw = function(values, size) {
    let rgb = hsluv.hsluvToRgb(values);
    fillHsluv(values[0], values[1], values[2]);
    // print(values);
    // fill(rgb[0]*255, rgb[1]*255, rgb[2]*255);
    stroke(0);
    let s2 = size/2;
    ellipse(s2, s2, size);
  }
}
let color_glyph = new ColorGlyph();

function highlightGlyph(glyphSize) {
  let halfSize = glyphSize / 2.0;
  stroke(0, 0, 255, 128);
  noFill();
  strokeWeight(4);
  ellipse(halfSize, halfSize, glyphSize+4);
  fill(0);
  strokeWeight(1);
}

function getGyphObject() {
  return gray_glyph;
}

function drawGlyph(glyphValues, glyphSize) {
  let shawdowShift = glyphSize / 5.0;
  let glyphMode = glyphSelector.value();
   if(glyphMode != "glyph") {
    translate(-shawdowShift, -shawdowShift);
    color_glyph.draw(glyphValues, glyphSize);
    translate(shawdowShift, shawdowShift);
  }
  if(glyphMode != "color") {
    gray_glyph.draw(glyphValues, glyphSize);
  }
}

function drawDriveMode() {
  let glyphSize = 320;
  let halfSize = glyphSize / 2;

  background(backgroundColor);
  let middle_x = canvasWidth / 2;
  let middle_y = canvasHeight / 2;
  middle_x = middle_x + glyphSize / 10.0;
  middle_y = middle_y + glyphSize / 10.0;
  let val = [0,0,0];
  for(i=0; i<3; i++) {
    val[i] = val_sliders[i].value() / 10.0;
  }

  resetMatrix();
  translate(middle_x - halfSize, middle_y - halfSize);
  drawGlyph(val, glyphSize);

  if (show_oddball) {
    resetMatrix();
    translate(middle_x - halfSize, middle_y - halfSize);
    highlightGlyph(glyphSize)
  }

  // resetMatrix();
  // translate(middle_x + halfSize + 32, middle_y - halfSize);
  // color_glyph.draw(val, glyphSize);
}

function drawGridMode() {
  let mode = modeSelector.value();

  let glyphSize = parseInt(sizeSelector.value(), 10);
  background(backgroundColor);
  if (show_oddball &&  mode == 'oddball') {
    resetMatrix();
    translate(gridOffsetX + oddball_col * gridSpacingX, gridOffsetY + oddball_row * gridSpacingY);
    highlightGlyph(glyphSize)
  }
  let hexOffset = (mode == "image");
  for (let i=0; i<numGridRows; i++) {
    let tweakedNumGridCols = numGridCols;
    let offsetX = 0;
    if (hexOffset && i%2 == 1) {
      offsetX = gridSpacingX / 2;
      tweakedNumGridCols = numGridCols - 1;
    }
    for (let j=0; j<tweakedNumGridCols; j++) {
      resetMatrix();
      translate(gridOffsetX + j * gridSpacingX + offsetX, gridOffsetY + i * gridSpacingY);
      drawGlyph(gridValues[i][j], glyphSize);
      resetMatrix();
    }
  }
}

function colorCopyArray(c) {
  d = Array(18);
  for(let i=0; i<18; i++) {
    d[i] = Array(18);
    for(let j=0; j<18; j++) {
      d[i][j] = c[i][j];
    }
  }
  return d;
}

function checkImageUpdate() {
  let mode = modeSelector.value();

  isSwappingEmoji = false;
  if (mode == "image") {
    now = millis();
    if(lastKeyPressedTime + 1000 * secondsUntilSwapMode < now) {
      // key not pressed recently
      if(lastEmojiSwappedTime + 1000 * secondsPerEmoji < now) {
        prevEmoji = curEmoji;
        prevEmojiColors = colorCopyArray(curEmojiColors);
        // no swaps recently
        updateEmoji(1);
        nextEmojiColors = colorCopyArray(curEmojiColors);
        lastEmojiSwappedTime = now;
      }
      if(now - lastEmojiSwappedTime < 1000) {
        isSwappingEmoji = true;
        emojiSwapLerp = (now - lastEmojiSwappedTime) / 1000.0;
        // print("LERP: " + emojiSwapLerp);
        for (let i=0; i<numGridRows; i++) {
          for (let j=0; j<numGridCols; j++) {
            // let curColor = lerpColor(prevEmojiColors[i][j], nextEmojiColors[i][j], emojiSwapLerp);
            let curColor = prevEmojiColors[i][j];
            if (curColor) {
              curColor = lerpColor(prevEmojiColors[i][j], nextEmojiColors[i][j], emojiSwapLerp);
              curEmojiPixels[i][j][0] = curColor._getHue();
              curEmojiPixels[i][j][1] = curColor._getSaturation();
              curEmojiPixels[i][j][2] = curColor._getBrightness();
            }
          }
        }
        refreshGridData();
      }
      else {
        for (let i=0; i<numGridRows; i++) {
          for (let j=0; j<numGridCols; j++) {
            let curColor = nextEmojiColors[i][j];
            if (curColor) {
              curEmojiPixels[i][j][0] = curColor._getHue();
              curEmojiPixels[i][j][1] = curColor._getSaturation();
              curEmojiPixels[i][j][2] = curColor._getBrightness();
            }
          }
        }
        refreshGridData();
      }
    }
  }
}

let is_drawing = false;
function draw () {
  if (is_drawing) {
    return;
  }
  is_drawing = true;
  let mode = modeSelector.value();

  if (mode == "sketch") {
    image(sketchImg, 0, 0, width, height);
    is_drawing = false;
    return;
  }

  checkImageUpdate();

  if (mode == 'edit') {
    drawDriveMode();
  }
  else {
    drawGridMode();
  }
  resetMatrix();
  if (mode == "image") {
    image(curEmojiImg, 96, height-32-36);
  }
  is_drawing = false;
}

function keyTyped() {
  if (key == '!') {
    saveBlocksImages();
  }
  else if (key == '@') {
    saveBlocksImages(true);
  }
  else if (key == ' ') {
    refreshGridData();
    redraw();
  }
  else if (key == 'd') {
    let curGlyph = glyphSelector.value()
    if(curGlyph == "color") {
      glyphSelector.value('glyph');
    }
    else if(curGlyph == "glyph") {
      glyphSelector.value('both');
    }
    else if(curGlyph == "both") {
      glyphSelector.value('color');
    }
    redraw();
  }
  else if (key == 'c') {
    let old_value = guideCheckbox.checked();
    guideCheckbox.checked(!old_value);
    guideChangedEvent();
  }
  else if (key == '1') {
    sizeSelector.value('32');
    sizeChangedEvent()
  }
  else if (key == '2') {
    sizeSelector.value('64');
    sizeChangedEvent()
  }
  else if (key == '3') {
    sizeSelector.value('128');
    sizeChangedEvent()
  }
  else if (key == 's') {
    modeSelector.value('sketch');
    modeChangedEvent()
  }
  else if (key == 'e') {
    modeSelector.value('edit');
    modeChangedEvent()
  }
  else if (key == 'g') {
    modeSelector.value('gradient');
    modeChangedEvent()
  }
  else if (key == 'r') {
    modeSelector.value('random');
    modeChangedEvent()
  }
  else if (key == 'o') {
    modeSelector.value('oddball');
    modeChangedEvent()
  }
  else if (key == 'i') {
    modeSelector.value('image');
    modeChangedEvent()
  }
}

function updateEmoji(offset) {
    curEmoji = (curEmoji + NUM_EMOJI + offset) % NUM_EMOJI;
    modeChangedEvent()
}

function keyPressed() {
  lastKeyPressedTime = millis();

  if (keyCode == LEFT_ARROW) {
    updateEmoji(-1);
  }
  else if (keyCode == RIGHT_ARROW) {
    updateEmoji(1);
  }
  else if (keyCode == UP_ARROW) {
    updateEmoji(-38);
  }
  else if (keyCode == DOWN_ARROW) {
    updateEmoji(38);
  }
}

function mouseMoved() {
  lastKeyPressedTime = millis();
}

function mouseDragged() {
  lastKeyPressedTime = millis();
}
