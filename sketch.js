let events = [];
let eventIndex = 0;
let currentState = "phoneDown";
let currentText = "";
let currentEventTime = 0;
let currentEventDuration = 0;
let table;
let baconImg1;
let selectedPart = null;
let startTime = 0;
let partButtons = [];
let escBtn;

let socket;
let clockOffset = 0;
let isHost = false;
let isWaiting = false;
let connectedClients = [];
let startBtn;
let measureLabel;
let measureInput;
let measureOffset = 0;
let debugMode = true;
let lastStateUpdate = 0;

function preload() {
  table = loadTable("onsets.csv", "csv", "header");
  baconImg1 = loadImage("images/bacon_figure-lying-flat.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(48);
  imageMode(CENTER);

  socket = io();

  socket.on("clock-sync-response", (data) => {
    let now = Date.now();
    let roundTrip = now - data.clientTime;
    let serverTimeAdjusted = data.serverTime + roundTrip / 2;
    clockOffset = serverTimeAdjusted - now;
  });

  socket.on("client-list", (clients) => {
    connectedClients = clients;
  });

  socket.on("start", (serverStartTime) => {
    let localStartTime = serverStartTime - clockOffset;
    startTime = localStartTime;
    isWaiting = false;
    loadEvents(selectedPart);
  });

  runClockSync();

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

function runClockSync() {
  let syncCount = 0;
  let offsets = [];

  function doSync() {
    socket.emit("clock-sync", Date.now());
  }

  socket.on("clock-sync-response", (data) => {
    let now = Date.now();
    let roundTrip = now - data.clientTime;
    let serverTimeAdjusted = data.serverTime + roundTrip / 2;
    let offset = serverTimeAdjusted - now;
    offsets.push(offset);
    syncCount++;

    if (syncCount < 5) {
      setTimeout(doSync, 100);
    } else {
      offsets.sort((a, b) => a - b);
      clockOffset = offsets[Math.floor(offsets.length / 2)];
    }
  });

  doSync();
}

function createPartButtons() {
  let labels = [
    "Player 1",
    "Player 2",
    "Player 3",
    "Player 4",
    "Player 5",
    "Laptop",
  ];
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
    let x =
      col === 0 ? width / 2 - b.elt.offsetWidth - gap / 2 : width / 2 + gap / 2;
    let y = height / 2 + row * (gap + b.elt.offsetHeight);
    b.position(x, y);
  }
}

function selectPart(part) {
  selectedPart = part;
  for (let b of partButtons) b.remove();
  partButtons = [];

  if (part === "6") {
    isHost = true;
    socket.emit("register-host");
    createHostUI();
  } else {
    isHost = false;
    isWaiting = true;
    socket.emit("register-client", part);
  }
}

function createHostUI() {
  startBtn = createButton("Start Performance");
  let btnStyle = {
    "font-size": "32px",
    padding: "20px 60px",
    border: "none",
    "border-radius": "16px",
    "background-color": "#4CAF50",
    color: "#ffffff",
    cursor: "pointer",
    "touch-action": "manipulation",
  };
  for (let [prop, val] of Object.entries(btnStyle)) {
    startBtn.style(prop, val);
  }
  startBtn.position(width / 2 - startBtn.elt.offsetWidth / 2, height / 2 + 100);
  startBtn.mousePressed(() => {
    socket.emit("start");
    startBtn.attribute("disabled", "");
    startBtn.style("background-color", "#888");
  });
}

function resetApp() {
  events = [];
  eventIndex = 0;
  currentState = "phoneDown";
  currentText = "";
  currentEventTime = 0;
  currentEventDuration = 0;
  selectedPart = null;
  startTime = 0;
  isHost = false;
  isWaiting = false;
  connectedClients = [];

  for (let b of partButtons) b.remove();
  partButtons = [];

  if (startBtn) {
    startBtn.remove();
    startBtn = null;
  }

  createPartButtons();
}

function loadEvents(part) {
  events = [];
  eventIndex = 0;

  let timeCol = "onset_ms_" + part;
  let stateCol = "state_" + part;
  let textCol = "text_" + part;

  for (let r = 0; r < table.getRowCount(); r++) {
    let st = table.getString(r, stateCol);
    if (!st || st.trim() === "") continue;
    let txt = table.getString(r, textCol);
    let durStr = table.getString(r, "measureDur_s");
    let dur = durStr ? parseFloat(durStr) : 0;
    events.push({
      time: table.getNum(r, timeCol),
      state: st.trim(),
      text: txt ? txt.trim() : "",
      duration: dur * 1000,
    });
  }
}

function draw() {
  if (selectedPart === null) {
    background(0);
    fill(255);
    noStroke();
    text("Select a part", width / 2, height / 2 - 80);
    return;
  }

  if (isHost) {
    drawHostScreen();
    return;
  }

  if (isWaiting) {
    background(0);
    fill(255);
    noStroke();
    textSize(36);
    text("Waiting for host to start...", width / 2, height / 2 - 40);
    textSize(24);
    fill(150);
    text("You are Player " + selectedPart, width / 2, height / 2 + 20);
    textSize(48);
    return;
  }

  let elapsed = Date.now() - startTime;
  if (eventIndex < events.length && elapsed >= events[eventIndex].time) {
    currentState = events[eventIndex].state;
    currentText = events[eventIndex].text;
    currentEventTime = events[eventIndex].time;
    currentEventDuration = events[eventIndex].duration;
    console.log(
      `[Player ${selectedPart}] Event ${eventIndex}: ${currentState} @ ${elapsed}ms`,
    );
    eventIndex++;
  }

  if (Date.now() - lastStateUpdate > 200) {
    socket.emit("state-update", {
      state: currentState,
      eventIndex: eventIndex,
      elapsed: elapsed,
    });
    lastStateUpdate = Date.now();
  }

  ///CURRENT STATE DRAWING LOGIC////////////////////////////////////////////////////

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
    background(0);
    let scale = min(width / baconImg1.width, height / baconImg1.height) * 0.85;
    image(
      baconImg1,
      width / 2,
      height / 2,
      baconImg1.width * scale,
      baconImg1.height * scale,
    );
  } else if (currentState === "bacon01rise") {
    let progress =
      currentEventDuration > 0
        ? constrain((elapsed - currentEventTime) / currentEventDuration, 0, 1)
        : 0;
    background(255);
    let scale = min(width / baconImg1.width, height / baconImg1.height) * 0.85;
    image(
      baconImg1,
      width / 2,
      height / 2,
      baconImg1.width * scale,
      baconImg1.height * scale,
    );
    let overlayAlpha = lerp(255, 0, progress);
    fill(0, 0, 0, overlayAlpha);
    noStroke();
    rect(0, 0, width, height);
  } else if (currentState === "bacon01bright") {
    background(255);
    let scale = min(width / baconImg1.width, height / baconImg1.height) * 0.85;
    image(
      baconImg1,
      width / 2,
      height / 2,
      baconImg1.width * scale,
      baconImg1.height * scale,
    );
    let flickerAlpha = random(0, 0.3) * 255;
    fill(0, 0, 0, flickerAlpha);
    noStroke();
    rect(0, 0, width, height);
  } else if (currentState === "flash50") {
    let cycleDuration = 1200;
    let flashDuration = 100;
    let cyclePosition = elapsed % cycleDuration;
    if (cyclePosition < flashDuration) {
      background(255);
    } else {
      background(0);
    }
  } else if (currentState === "bacon01flash") {
    let cycleDuration = 1200;
    let flashDuration = 100;
    let cyclePosition = elapsed % cycleDuration;
    if (cyclePosition < flashDuration) {
      background(255);
    } else {
      background(0);
    }
    let scale = min(width / baconImg1.width, height / baconImg1.height) * 0.85;
    image(
      baconImg1,
      width / 2,
      height / 2,
      baconImg1.width * scale,
      baconImg1.height * scale,
    );

    if (debugMode) {
      drawDebugOverlay(elapsed);
    }
  }

  function drawDebugOverlay(elapsed) {
    push();
    textAlign(LEFT, TOP);
    textSize(14);
    fill(255, 255, 0);
    noStroke();

    let debugY = 50;
    let debugX = 10;
    let lineHeight = 18;

    fill(0, 0, 0, 150);
    rect(5, 45, 200, 110, 5);

    fill(255, 255, 0);
    text(`Player: ${selectedPart}`, debugX, debugY);
    text(
      `Elapsed: ${(elapsed / 1000).toFixed(2)}s`,
      debugX,
      debugY + lineHeight,
    );
    text(`State: ${currentState}`, debugX, debugY + lineHeight * 2);
    text(
      `Event: ${eventIndex} / ${events.length}`,
      debugX,
      debugY + lineHeight * 3,
    );
    text(
      `Clock Offset: ${clockOffset.toFixed(0)}ms`,
      debugX,
      debugY + lineHeight * 4,
    );
    text(
      `Next: ${eventIndex < events.length ? events[eventIndex].time + "ms" : "done"}`,
      debugX,
      debugY + lineHeight * 5,
    );
    pop();
  }

  function drawHostScreen() {
    background(30);
    fill(255);
    noStroke();
    textSize(36);
    text("Host Control Panel", width / 2, 80);

    textSize(24);
    text("Connected Players:", width / 2, 140);

    textSize(16);
    textAlign(LEFT, TOP);

    if (connectedClients.length === 0) {
      fill(150);
      textAlign(CENTER, CENTER);
      text("No players connected yet", width / 2, 200);
    } else {
      connectedClients.sort((a, b) => parseInt(a.part) - parseInt(b.part));

      let boxWidth = 280;
      let boxHeight = 80;
      let startY = 170;
      let cols = min(3, connectedClients.length);
      let totalWidth = cols * boxWidth + (cols - 1) * 20;
      let startX = (width - totalWidth) / 2;

      for (let i = 0; i < connectedClients.length; i++) {
        let c = connectedClients[i];
        let col = i % cols;
        let row = floor(i / cols);
        let x = startX + col * (boxWidth + 20);
        let y = startY + row * (boxHeight + 15);

        let stateColor = getStateColor(c.state);
        fill(stateColor);
        rect(x, y, boxWidth, boxHeight, 8);

        fill(0);
        textSize(20);
        text(`Player ${c.part}`, x + 10, y + 10);

        textSize(14);
        fill(50);
        text(`State: ${c.state || "waiting"}`, x + 10, y + 35);
        text(
          `Event: ${c.eventIndex || 0}  |  ${((c.elapsed || 0) / 1000).toFixed(1)}s`,
          x + 10,
          y + 55,
        );
      }
    }

    textAlign(CENTER, CENTER);

    if (startBtn) {
      startBtn.position(width / 2 - startBtn.elt.offsetWidth / 2, height - 150);
    }
  }

  function getStateColor(state) {
    if (!state || state === "waiting") return color(100, 100, 100);
    if (state === "phoneUp") return color(255, 255, 255);
    if (state === "phoneDown") return color(80, 80, 80);
    if (state && state.includes("flash")) return color(255, 100, 255);
    if (state && state.startsWith("bacon")) return color(255, 200, 100);
    return color(150, 150, 150);
  }

  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if (partButtons.length > 0) positionButtons();
    if (startBtn) {
      startBtn.position(
        width / 2 - startBtn.elt.offsetWidth / 2,
        height / 2 + 100,
      );
    }
  }
}
