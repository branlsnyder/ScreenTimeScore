# Screen Time Score

The score for performing 'Screen Time' by Brandon Woo Snyder (2026). 

A networked performance score for 5 musicians, where each's smartphone screen directs their playing. Each musician follows a precisely-timed sequence of visual states (white screen, black screen, images, flickers, flashes) displayed on their device, synchronized across all players.

## Technical Needs
- **5 smartphones and 1 computer**
- All devices must be on the **same Wi-Fi network**.
- Install [Node.js](https://nodejs.org) (LTS version) — only needed once

## How It Works

1. **On the laptop**, double-click the **Launch-Score** file (Launch-Score.bat for Windows, Launch-Score.command for MacOS)
2. **Players 1–5** connect on smartphones. Open the link displayed by Launch-Score. 
3. **Players 1–5** select your player number on the start screen and wait for the score to being. 
4. **On the laptop** select "Laptop"
5. The laptop controls the score. The laptop sees a control panel showing all connected players and a "Start Performance" button.

## Troubleshooting

- Node.js must be installed
- The laptop and all smartphones must be on the same WiFi network.



## Visual States

- The score is defined in `onsets.csv`, a millisecond-precision timeline with per-player columns for timing, visual state, and text instructions.


| State                  | Display                                          |
| ---------------------- | ------------------------------------------------ |
| `phoneUp`              | White screen with text                           |
| `phoneDown`            | Black screen with text                           |
| `bacon01`              | Francis Bacon figure image on white background   |
| `bacon01rise`          | Bacon image fading in from black overlay         |
| `bacon01flickersubtle` | Bacon image with subtle random dark overlay      |
| `bacon01flickerheavy`  | Bacon image with heavy random full-range flicker |
| `flash50`              | Alternating black/white flash at 1.2s cycle      |
| `bacon01flash`         | Bacon image with black/white flash cycle         |

## Quick Start (No Terminal Needed)

1. Install [Node.js](https://nodejs.org) (LTS version) — only needed once
2. Double-click `start.command` (macOS) or `start.bat` (Windows)
3. The server starts and shows a URL — open that URL on all phones + the laptop

All devices must be on the **same Wi-Fi network**.

## Manual Setup

```bash
npm install
npm start
```

The server runs on `http://localhost:3000`. For networked devices, connect using the local IP address printed in the console.

## Tech

- **p5.js** – canvas rendering on each device
- **Socket.IO** – real-time clock sync, state broadcasting, host control
- **Express** – static file server
- Clock sync uses median offset from 5 round-trip measurements to minimize latency drift across devices.

## Project Structure

```
ScreenTimeScore/
├── server.js          – Node.js/Express + Socket.IO host
├── sketch.js          – p5.js client logic (states, sync, UI)
├── index.html         – entry point
├── onsets.csv         – the score: per-player, per-measure timing
├── images/            – Francis Bacon painting references
│   ├── bacon_figure-lying-flat.jpg
│   ├── bacon_collapsed-figure.jpg
│   ├── bacon_fallen-figure.jpg
│   ├── bacon_falling-figure.jpg
│   └── bacon_man-on-bed.jpg
└── archivedOnsets/    – earlier score drafts
```

## Notation / CSV Format

Each player has three columns in the CSV: `onset_ms_N`, `state_N`, `text_N`. Additional columns include `measureNum`, `measureDur_s`, and experimental phase parameters. Empty cells indicate no event change at that moment for that player.
