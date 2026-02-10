# Geography Game

A minimalistic browser game with two geography modes: **Flag Guesser** and **Population Game**. Country data is loaded from the [REST Countries](https://restcountries.com/) API.

## Game Modes

### Flag Guesser
- A flag is shown with **4 multiple-choice** country names.
- **3 lives** (hearts). Wrong answers cost a life.
- **Score** increases with each correct guess.
- Green flash on correct answer, red flash on wrong answer.

### Population Game
- Two countries are shown (flag + name). Guess whether the **left** country has a **higher** or **lower** population than the **right**.
- **3 lives** and **score** as above.
- Green/red flash feedback. After each round, both countries are replaced with two new ones.

## How to Run

1. **Open in a browser**  
   Double-click `index.html` or open it from your browser’s File menu.

2. **Or use a local server** (recommended if you see loading or CORS issues):
   ```bash
   npx serve .
   ```
   Then open the URL shown (e.g. `http://localhost:3000`).

## Files

| File        | Purpose                    |
|------------|----------------------------|
| `index.html` | Structure and game screens |
| `styles.css`  | Layout and animations      |
| `script.js`  | Game logic and API calls   |
