let events = [];
let eventIndex = 0;
let currentState = 'phoneDown';
let table;
let baconImg;

function preload() {
  table = loadTable('onsets.csv', 'csv', 'header');
  baconImg = loadImage('images/bacon_figure-lying-flat.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(48);
  imageMode(CENTER);

  for (let r = 0; r < table.getRowCount(); r++) {
    events.push({
      time:  table.getNum(r, 'onset_ms'),
      state: table.getString(r, 'state').trim()
    });
  }
}

function draw() {
  if (eventIndex < events.length && millis() >= events[eventIndex].time) {
    currentState = events[eventIndex].state;
    eventIndex++;
  }

  if (currentState === 'phoneUp') {
    background(255);
    fill(0);
    noStroke();
    text('Phone Up', width / 2, height / 2);

  } else if (currentState === 'phoneDown') {
    background(0);
    fill(128);
    noStroke();
    text('Phone Down', width / 2, height / 2);

  } else if (currentState === 'bacon01') {
    background(255);
    let scale = min(width / baconImg.width, height / baconImg.height) * 0.85;
    image(baconImg, width / 2, height / 2, baconImg.width * scale, baconImg.height * scale);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
