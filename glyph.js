/* change default application behavior */
var defaultMode = "image";
var defaultSize = 32;
var defaultDisplay = "glyph"
var defaultEmoji = 38 * 10 + 36;
var backgroundColor = "hsb(260, 8%, 88%)";

let xposArray = [];
let yposArray = [];
let radiusArray = [];
let numDots = 3;

let xcirArray = [];
let ycirArray = [];
let rcirArray = [];
let numCirs = 4;

function Glyph() {

  /*
   * values is an array of 3 numbers: [hue, saturation, lightness]
   *   + hue ranges from 0..360
   *   + saturation ranges from 0..100
   *   + lightness ranges from 0..100
   *
   * size is the number of pixels for width and height
   *
   * use p5.js to draw a round grayscale glyph
   * the glyph should stay within the ellipse [0, 0, width, height]
   * this is a grayscale glyph, so only lightness can be adjusted.
   * the range for lightness is 0..100
   *
   * When setting the lightness of stroke or fill always use either strokeUniform()
   * or fillUniform() calls. Each takes one arguement - the lightness from
   * 0 to 100. Examples:
   *       - fillUniform(50);    // ranges from 0-100
   *       - strokeUniform(100); // white
   */
  this.draw = function(values, size) {
    let s2 = size/2;

    let scaleFactor = map(size,320,32,1,0.1);


    //// lightness controls shapes and size////
    let color1 = map(values[2], 0, 100, 10, 70);
    // lightness controls size//
    if (values[2] < 27) {
      shaperadius = map(values[2], 0, 27, 220, 100);
    } if (values[2] >= 27 && values[2] < 37) {
      shaperadius = map(values[2], 27, 37, 100, 100);
    } if (values[2] >= 37 && values[2] < 64) {
      shaperadius = map(values[2], 37, 64, 100, 200);
    } if (values[2] >= 64 && values[2] < 74) {
      shaperadius = map(values[2], 64, 74, 200, 200);
    } if (values[2] >= 74 && values[2] <= 100) {
      shaperadius = map(values[2], 74, 100, 200, 100);
    }
    //lightness controls shape//
    if (values[2] < 27) {
      rectcorner = map(values[2], 0, 27, 0, 0);
    } if (values[2] >= 27 && values[2] <= 37) {
      rectcorner = map(values[2], 27, 37, 0, 110);
    } if (values[2] > 37 && values[2] < 64) {
      rectcorner = map(values[2], 37, 64, 110, 110);
    } if (values[2] >= 64 && values[2] <= 74) {
      rectcorner = map(values[2], 67, 74, 100, 0);
    } if (values[2] > 74 && values[2] <= 100) {
      rectcorner = map(values[2], 74, 100, 0, 0);
    }
    //lightness controls the rotation//
    if (values[2] < 20) {
      shaperotate = map(values[2], 0, 20, 0, 0);
    } if (values[2] >= 20 && values[2] <= 40) {
      shaperotate = map(values[2], 20, 40, 0, 50);
    } if (values[2] > 40 && values[2] < 60) {
      shaperotate = map(values[2], 40, 60, 50, 0);
    } if (values[2] >= 60 && values[2] <= 80) {
      shaperotate = map(values[2], 60, 80, 0, 45);
    } if (values[2] > 80 && values[2] <= 100) {
      shaperotate = map(values[2], 80, 100, 45, 45);
    }
    //draw the shape and size//
    push();
    translate(s2,s2);
    scale(scaleFactor);
    strokeUniform(color1);
    fillUniform(color1)
    rectMode(CENTER);
    rotate(shaperotate);
    rect(0, 0, shaperadius, shaperadius, rectcorner);
    pop();
    ////end lightness part////


    //// saturation controls circles and points ////
    noLoop();
    push();
    translate(s2,s2);
    scale(scaleFactor);
    // inner color based on saturation
    let color2 = map(values[1], 0, 100, color1+20, 240);
    let color3 = map(values[1], 0, 100, 240, color1-20);
    let color4 = map(values[1], 0, 100, color1-40, 200);
    let color5 = map(values[1], 0, 100, color1-20, 180);


    ///add one more shape here that saturation controls//
    let color6 = map(values[1], 0, 100, color1-20, color1+30);
    let radiusat = map(values[1], 0, 100, 80, 100);
    fillUniform(color6);
    strokeUniform(color6);
    ellipse(0,0,radiusat,radiusat);

    ///saturation controls the number of points///
    fillUniform(color4);
    strokeUniform(color4);
    let value = int(map(values[1],0,100,2,6));
    if (value != numDots) {
      numDots = value;
      numPoint(s2, numDots, int(random(8,20)), 1);
    }
    for (let i = 0; i <= numDots; i++) {
      ellipse(xposArray[i], yposArray[i], radiusArray[i], radiusArray[i]);
    }

    ///saturation controls the number of circles///
    fillUniform(color3);
    strokeUniform(color3);
    noFill();
    strokeWeight(3);
    value = 4 - round(map(values[1],0,100,0,3));
    if (value != numCirs) {
      numCirs = value;
      numPoint(s2, numCirs, int(random(20,50)), 0);
    }
    for (let i = 0; i < numCirs; i++) {
      ellipse(xcirArray[i], ycirArray[i], rcirArray[i], rcirArray[i]);
    }

    pop();
    ////end saturation part////


    //// hue controls lines and rotation////
    strokeUniform(color5);
    strokeWeight(5);
    angleMode(DEGREES);
    push();
    translate(s2,s2);
    scale(scaleFactor);

    let shift_hue = map(values[0], 0, 100, 0, 100);
    let linecount = int(shift_hue/65);
    let linedist = int(linecount) + 3;
    let linepos = size / linedist;
    let linelength = (shift_hue/3)+100;
    //print(linelength);


    if (linecount % 2 == 1) {
      let lineorder = (linecount+1)/2;
      rotate(shift_hue);
      for (let i = 0; i <= lineorder; i++ ) {
        ellipseMode(CENTER);
        ellipse(0,0+linepos*(i),(linelength+40)-(60*i),1);
        ellipse(0,0-linepos*(i),(linelength+40)-(60*i),1);
      }
    } else {
      rotate(shift_hue);
      for (let i = 0; i <= (linecount+1); i++ ) {
        ellipseMode(CENTER);
        ellipse(0,-s2+linepos*(i+1),(linelength-20),1);
      }
    }
    pop();
    ////end hue part////
  }
}

////call the saturation array part////
function numPoint(s2, num, r, isDot) {

  if (isDot) { //the points array//
    xposArray = [];
    yposArray = [];
    radiusArray = [];
    for (var i = 0; i <= num; i++) {
      xposArray.push(random(-s2+55, s2-55));
      yposArray.push(random(-s2+55, s2-55));
      radiusArray.push(r);
    }
  } else { //the circles array//
    xcirArray = [];
    ycirArray = [];
    rcirArray = [];
    for (var i = 0; i <= num; i++) {
      xcirArray.push(random(-s2+80, s2-80));
      ycirArray.push(random(-s2+80, s2-80));
      rcirArray.push(r);
    }
  }
}
