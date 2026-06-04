# ScreenTimeScore

A networked performance score for up to 5 players + 1 host, where smartphone screens serve as the instrument. Each player follows a precisely-timed sequence of visual states (white screen, black screen, images, flickers, flashes) displayed on their device, synchronized across all players via WebSocket.

## How It Works

- **Players 1–5** connect as performers. Each player selects their part on the starting screen, then waits for the host to begin.
- **Player 6 (Laptop)** acts as the host. The host sees a control panel showing all connected players and a "Start Performance" button.
- When the host starts, every player's device synchronizes to a shared clock and begins executing its part of the score simultaneously.
- The score is defined in `onsets.csv`, a millisecond-precision timeline with per-player columns for timing, visual state, and text instructions.

## Visual States

| State | Display |
|---|---|
| `phoneUp` | White screen with text |
| `phoneDown` | Black screen with text |
| `bacon01` | Francis Bacon figure image on white background |
| `bacon01rise` | Bacon image fading in from black overlay |
| `bacon01flickersubtle` | Bacon image with subtle random dark overlay |
| `bacon01flickerheavy` | Bacon image with heavy random full-range flicker |
| `flash50` | Alternating black/white flash at 1.2s cycle |
| `bacon01flash` | Bacon image with black/white flash cycle |

## Setup

```bash
npm install
npm start
```

The server runs on `http://localhost:3000`. For networked devices, connect using the local IP address on the same network.

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
