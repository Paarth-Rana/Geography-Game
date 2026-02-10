const API_URL = 'https://restcountries.com/v3.1/all?fields=name,population,flags';

let countries = [];
let flagScore = 0;
let flagLives = 3;
let popScore = 0;
let popLives = 3;

const screens = {
  modeSelect: document.getElementById('mode-select'),
  flagGame: document.getElementById('flag-game'),
  populationGame: document.getElementById('population-game'),
};

const flagEls = {
  display: document.getElementById('flag-display'),
  options: document.getElementById('flag-options'),
  score: document.getElementById('flag-score'),
  back: document.getElementById('flag-back'),
};

const popEls = {
  left: document.getElementById('pop-left'),
  right: document.getElementById('pop-right'),
  leftFlag: document.getElementById('pop-left-flag'),
  leftName: document.getElementById('pop-left-name'),
  rightFlag: document.getElementById('pop-right-flag'),
  rightName: document.getElementById('pop-right-name'),
  leftPromptName: document.getElementById('pop-left-prompt-name'),
  rightPromptName: document.getElementById('pop-right-prompt-name'),
  score: document.getElementById('pop-score'),
  higher: document.getElementById('pop-higher'),
  lower: document.getElementById('pop-lower'),
  back: document.getElementById('pop-back'),
};

const overlays = {
  gameOver: document.getElementById('game-over'),
  finalScore: document.getElementById('final-score'),
  playAgain: document.getElementById('play-again'),
  loading: document.getElementById('loading'),
};

// --- Data ---
async function fetchCountries() {
  overlays.loading.classList.remove('hidden');
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    countries = data.filter(c => c.name?.common && c.population != null && c.flags?.png);
    return countries;
  } finally {
    overlays.loading.classList.add('hidden');
  }
}

function pickRandom(arr, n, exclude = null) {
  const pool = exclude ? arr.filter(c => c !== exclude) : [...arr];
  const out = [];
  while (out.length < n && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

// --- Screens ---
function showScreen(screen) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// --- Flag game ---
let currentFlagCountry = null;
let flagOptionButtons = [];

function getHeartsContainer(game) {
  return game === 'flag' ? document.querySelector('#flag-game .lives') : document.querySelector('#population-game .lives');
}

function loseLife(game) {
  if (game === 'flag') {
    flagLives--;
    const hearts = getHeartsContainer('flag').querySelectorAll('.heart');
    hearts[flagLives]?.classList.add('lost');
    return flagLives <= 0;
  } else {
    popLives--;
    const hearts = getHeartsContainer('population').querySelectorAll('.heart');
    hearts[popLives]?.classList.add('lost');
    return popLives <= 0;
  }
}

const playAgainBtn = document.getElementById('play-again');
const popButtonsContainer = document.querySelector('#population-game .pop-buttons');

function showGameOver(game) {
  const score = game === 'flag' ? flagScore : popScore;
  overlays.finalScore.textContent = score;
  overlays.gameOver.classList.remove('hidden');
  playAgainBtn.onclick = () => {
    overlays.gameOver.classList.add('hidden');
    if (game === 'flag') {
      resetFlagGame();
      nextFlagRound();
    } else {
      resetPopGame();
      nextPopRound();
    }
  };
}

function resetFlagGame() {
  flagScore = 0;
  flagLives = 3;
  flagEls.score.textContent = '0';
  getHeartsContainer('flag').querySelectorAll('.heart').forEach(h => h.classList.remove('lost'));
}

function nextFlagRound() {
  const [correct, ...wrong] = pickRandom(countries, 4);
  currentFlagCountry = correct;

  flagEls.display.innerHTML = '';
  const img = document.createElement('img');
  img.src = correct.flags.png;
  img.alt = '';
  flagEls.display.appendChild(img);

  const names = [correct, ...wrong].map(c => c.name.common);
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }

  flagEls.options.innerHTML = '';
  flagOptionButtons = names.map(name => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.textContent = name;
    btn.onclick = () => handleFlagAnswer(name, btn);
    flagEls.options.appendChild(btn);
    return btn;
  });
}

function handleFlagAnswer(selectedName, btn) {
  flagOptionButtons.forEach(b => b.setAttribute('disabled', ''));
  const correct = selectedName === currentFlagCountry.name.common;
  if (correct) {
    flagScore++;
    flagEls.score.textContent = flagScore;
    btn.classList.add('flash-correct');
  } else {
    btn.classList.add('flash-wrong');
    const correctBtn = flagOptionButtons.find(b => b.textContent === currentFlagCountry.name.common);
    if (correctBtn) correctBtn.classList.add('flash-correct');
    const isDead = loseLife('flag');
    if (isDead) {
      setTimeout(() => showGameOver('flag'), 600);
      return;
    }
  }
  setTimeout(() => nextFlagRound(), 800);
}

// --- Population game ---
let leftCountry = null;
let rightCountry = null;

function resetPopGame() {
  popScore = 0;
  popLives = 3;
  popEls.score.textContent = '0';
  getHeartsContainer('population').querySelectorAll('.heart').forEach(h => h.classList.remove('lost'));
}

function setPopCard(el, flagEl, nameEl, country) {
  flagEl.innerHTML = '';
  if (country) {
    const img = document.createElement('img');
    img.src = country.flags.png;
    img.alt = '';
    flagEl.appendChild(img);
    nameEl.textContent = country.name.common;
  } else {
    nameEl.textContent = '';
  }
}

function nextPopRound() {
  leftCountry = pickRandom(countries, 1)[0];
  rightCountry = pickRandom(countries, 1, leftCountry)[0];

  popEls.left.classList.remove('disappear', 'flash-correct', 'flash-wrong');
  popEls.right.classList.remove('disappear', 'flash-correct', 'flash-wrong');
  popButtonsContainer?.classList.remove('flash-correct', 'flash-wrong');

  setPopCard(popEls.left, popEls.leftFlag, popEls.leftName, leftCountry);
  setPopCard(popEls.right, popEls.rightFlag, popEls.rightName, rightCountry);
  if (popEls.leftPromptName) popEls.leftPromptName.textContent = leftCountry.name.common;
  if (popEls.rightPromptName) popEls.rightPromptName.textContent = rightCountry.name.common;

  popEls.higher.disabled = false;
  popEls.lower.disabled = false;
}

function handlePopAnswer(choice) {
  popEls.higher.disabled = true;
  popEls.lower.disabled = true;

  const leftPop = leftCountry.population;
  const rightPop = rightCountry.population;
  const actualHigher = leftPop > rightPop;
  const correct = (choice === 'higher' && actualHigher) || (choice === 'lower' && !actualHigher);

  if (correct) {
    popScore++;
    popEls.score.textContent = popScore;
    popEls.left.classList.add('flash-correct');
    popEls.right.classList.add('flash-correct');
    popButtonsContainer?.classList.add('flash-correct');
  } else {
    popEls.left.classList.add('flash-wrong');
    popEls.right.classList.add('flash-wrong');
    popButtonsContainer?.classList.add('flash-wrong');
    const isDead = loseLife('population');
    if (isDead) {
      setTimeout(() => showGameOver('population'), 600);
      return;
    }
  }

  setTimeout(() => {
    popEls.left.classList.remove('flash-correct', 'flash-wrong');
    popEls.right.classList.remove('flash-correct', 'flash-wrong');
    popButtonsContainer?.classList.remove('flash-correct', 'flash-wrong');

    // Both countries disappear
    popEls.left.classList.add('disappear');
    popEls.right.classList.add('disappear');

    setTimeout(() => {
      // Show 2 new countries
      leftCountry = pickRandom(countries, 1)[0];
      rightCountry = pickRandom(countries, 1, leftCountry)[0];

      setPopCard(popEls.left, popEls.leftFlag, popEls.leftName, leftCountry);
      setPopCard(popEls.right, popEls.rightFlag, popEls.rightName, rightCountry);
      if (popEls.leftPromptName) popEls.leftPromptName.textContent = leftCountry.name.common;
      if (popEls.rightPromptName) popEls.rightPromptName.textContent = rightCountry.name.common;

      popEls.left.classList.remove('disappear');
      popEls.right.classList.remove('disappear');
      popEls.higher.disabled = false;
      popEls.lower.disabled = false;
    }, 350);
  }, 600);
}

// --- Init ---
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (countries.length === 0) await fetchCountries();
    const mode = btn.dataset.mode;
    if (mode === 'flag') {
      resetFlagGame();
      showScreen(screens.flagGame);
      nextFlagRound();
    } else {
      resetPopGame();
      showScreen(screens.populationGame);
      nextPopRound();
    }
  });
});

flagEls.back.addEventListener('click', () => showScreen(screens.modeSelect));
popEls.back.addEventListener('click', () => showScreen(screens.modeSelect));

popEls.higher.addEventListener('click', () => handlePopAnswer('higher'));
popEls.lower.addEventListener('click', () => handlePopAnswer('lower'));

