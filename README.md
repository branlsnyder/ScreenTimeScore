# Screen Time Score

The score for performing 'Screen Time' by Brandon Woo Snyder (2026). The musicians read the score from their smartphone web browser. 

## Equipment Needs
To run the score you will need: 
- **5 smartphones and 1 computer**
- All devices must be on the **same Wi-Fi network**.
- Install [Node.js](https://nodejs.org) (LTS version) — only needed once

## How To Run The Score
1. **On the laptop**, double-click the **Launch-Score** file (Launch-Score.bat for Windows, Launch-Score.command for MacOS)
2. **Players 1–5** connect on smartphones. Open the link displayed by Launch-Score. 
3. **Players 1–5** select your player number on the start screen and wait for the score to being. 
4. **On the laptop** select "Laptop"
5. The laptop controls the score. The laptop sees a control panel showing all connected players and a "Start Performance" button.

## Troubleshooting

- Node.js must be installed
- The laptop and all smartphones must be on the same WiFi network.

That's it! 

## About the Score:
Though not necessary for performing, here are a few technical specs about the score, for those who may be curious:

## Notation

- All the events in the score are scripted in `onsets.csv`, which lists for each of the 5 musicians a 'state' and when in time to display that state. These states are small text scores, occasionally augmented by flashing lights or images.


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

## The Code
The events in `onsets.csv` are converted into a real-time video score that is played from a web browser. The code includes the following tools:

- **p5.js** – creates/loads all the visual matter on screen.
- **Socket.IO** – facilitates synchronization across all 5 smartphones.

## AI disclosure
The AI coding tools OpenCode and Big Pickle were used in the creation of the code that renders `onsets.csv` onto the musicians' smartphones

No AI was used in the creation of this README.md, nor in the composing of Screen Time (that is, the creation of `onsets.csv` nor the reference score PDF)