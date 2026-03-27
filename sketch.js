let events = [];
let eventIndex = 0;
let currentState = "phoneDown";
let currentText = "";
let table;
let baconImg1;
let baconImg2;
let baconImg3;
let baconImg4;
let baconImg5;
let selectedPart = null;
let startTime = 0;
let partButtons = [];
let escBtn;

function preload() {
  table = loadTable("onsets.csv", "csv", "header");
  baconImg1 = loadImage("images/bacon_figure-lying-flat.jpg");
  baconImg2 = loadImage("images/bacon_falling-figure.jpg");
  baconImg3 = loadImage("images/bacon_man-on-bed.jpg");
  baconImg4 = loadImage("images/bacon_fallen-figure.jpg");
  baconImg5 = loadImage("images/bacon_collapsed-figure.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(48);
  imageMode(CENTER);

  escBtn = createButton("✕");
  let escStyle = {
    "font-size": "20px",
    padding: "6px 12px",
    border: "none",
    "border-radius": "6px",
    "background-color": "rgba(255,255,255,0.25)",
    color: "#ffffff",
    cursor: "pointer",
    "touch-action": "manipulation",
    position: "fixed",
    top: "12px",
    right: "12px",
    "z-index": "1000",
  };
  for (let [prop, val] of Object.entries(escStyle)) {
    escBtn.style(prop, val);
  }
  escBtn.mousePressed(resetApp);

  createPartButtons();
}

function createPartButtons() {
  let labels = ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Laptop"];
  let btnStyle = {
    "font-size": "24px",
    padding: "14px 36px",
    border: "none",
    "border-radius": "12px",
    "background-color": "#ffffff",
    color: "#000000",
    cursor: "pointer",
    "touch-action": "manipulation",
  };

  for (let i = 0; i < labels.length; i++) {
    let b = createButton(labels[i]);
    for (let [prop, val] of Object.entries(btnStyle)) {
      b.style(prop, val);
    }
    let partNum = String(i + 1);
    b.mousePressed(() => selectPart(partNum));
    partButtons.push(b);
  }

  positionButtons();
}

function positionButtons() {
  let gap = 40;
  let cols = 2;
  for (let i = 0; i < partButtons.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let b = partButtons[i];
    let x = col === 0
      ? width / 2 - b.elt.offsetWidth - gap / 2
      : width / 2 + gap / 2;
    let y = height / 2 + row * (gap + b.elt.offsetHeight);
    b.position(x, y);
  }
}

function selectPart(part) {
  selectedPart = part;
  for (let b of partButtons) b.remove();
  partButtons = [];
  loadEvents(part);
}

function resetApp() {
  events = [];
  eventIndex = 0;
  currentState = "phoneDown";
  currentText = "";
  selectedPart = null;
  startTime = 0;
  for (let b of partButtons) b.remove();
  partButtons = [];
  createPartButtons();
}

function loadEvents(part) {
  let timeCol = "onset_ms_" + part;
  let stateCol = "state_" + part;
  let textCol = "text_" + part;

  for (let r = 0; r < table.getRowCount(); r++) {
    let st = table.getString(r, stateCol);
    if (!st || st.trim() === "") continue;
    let txt = table.getString(r, textCol);
    events.push({
      time: table.getNum(r, timeCol),
      state: st.trim(),
      text: txt ? txt.trim() : "",
    });
  }

  startTime = millis();
}

function draw() {
  if (selectedPart === null) {
    background(0);
    fill(255);
    noStroke();
    text("Select a part", width / 2, height / 2 - 80);
    return;
  }

  let elapsed = millis() - startTime;
  if (eventIndex < events.length && elapsed >= events[eventIndex].time) {
    currentState = events[eventIndex].state;
    currentText = events[eventIndex].text;
    eventIndex++;
  }

  if (currentState === "phoneUp") {
    background(255);
    fill(0);
    noStroke();
    text(currentText, width / 2, height / 2);
  } else if (currentState === "phoneDown") {
    background(0);
    fill(128);
    noStroke();
    text(currentText, width / 2, height / 2);
  } else if (currentState === "bacon01") {
    background(255);
    let scale = min(width / baconImg1.width, height / baconImg1.height) * 0.85;
    image(
      baconImg1,
      width / 2,
      height / 2,
      baconImg1.width * scale,
      baconImg1.height * scale,
    );
  } else if (currentState === "bacon02") {
    background(255);
    let scale = min(width / baconImg2.width, height / baconImg2.height) * 0.85;
    image(
      baconImg2,
      width / 2,
      height / 2,
      baconImg2.width * scale,
      baconImg2.height * scale,
    );
  } else if (currentState === "bacon03") {
    background(255);
    let scale = min(width / baconImg3.width, height / baconImg3.height) * 0.85;
    image(
      baconImg3,
      width / 2,
      height / 2,
      baconImg3.width * scale,
      baconImg3.height * scale,
    );
  } else if (currentState === "bacon04") {
    background(255);
    let scale = min(width / baconImg4.width, height / baconImg4.height) * 0.85;
    image(
      baconImg4,
      width / 2,
      height / 2,
      baconImg4.width * scale,
      baconImg4.height * scale,
    );
  } else if (currentState === "bacon05") {
    background(255);
    let scale = min(width / baconImg5.width, height / baconImg5.height) * 0.85;
    image(
      baconImg5,
      width / 2,
      height / 2,
      baconImg5.width * scale,
      baconImg5.height * scale,
    );
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (partButtons.length > 0) positionButtons();
}
