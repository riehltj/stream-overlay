/**************************************
 * CONFIG
 **************************************/
const MAX_GAMES = 24;
const GAME_ROTATION_INTERVAL = 15000; // rotation every 15s
const SCORE_TICK_INTERVAL = 5000;     // random score every 5s
const CLOCK_TICK_INTERVAL = 1000;     // 1s
const TICK_PROBABILITY = { fieldGoal: 0.2, touchdown: 0.1 };

/**************************************
 * STATE
 **************************************/
let games = [
    { teamA: "NightOwl", teamB: "CozyBear", scoreA: 21, scoreB: 18, quarter: 4, timeRemaining: 185, status: "LIVE" },
    { teamA: "PixelFox", teamB: "AstroCat", scoreA: 10, scoreB: 10, quarter: 3, timeRemaining: 522, status: "LIVE" },
    { teamA: "FrostyMike", teamB: "BlueNova", scoreA: 14, scoreB: 24, status: "FINAL" }
];

let visibleStartIndex = 0;
let knownNames = ["TylerFPS", "CozyBear", "PixelWitch", "NightOwl", "FrostyMike", "AstroCat", "BlueNova"];

/**************************************
 * HELPERS
 **************************************/
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

/**************************************
 * RENDER FUNCTION
 **************************************/
function renderTicker() {
    for (let i = 0; i < 3; i++) {
        const slot = document.getElementById(`game-${i}`);
        const game = games[(visibleStartIndex + i) % games.length];

        if (!game) {
            slot.innerHTML = "";
            continue;
        }

        const scoreLine = `
      <div class="game-score">
        <span>${game.teamA} ${game.scoreA}</span>
        <span>${game.teamB} ${game.scoreB}</span>
      </div>
    `;

        const metaLine = game.status === "FINAL"
            ? `<div class="game-meta">FINAL</div>`
            : `<div class="game-meta">Q${game.quarter} • ${formatTime(game.timeRemaining)}</div>`;

        slot.innerHTML = scoreLine + metaLine;
    }
}

/**************************************
 * GAME LOGIC
 **************************************/
function tickGames() {
    games.forEach(game => {
        if (game.status !== "LIVE") return;

        if (!game.timeRemaining) game.timeRemaining = 300;
        game.timeRemaining -= 1;

        if (game.timeRemaining <= 0) {
            if (game.quarter < 4) {
                game.quarter += 1;
                game.timeRemaining = 300;
            } else {
                game.status = "FINAL";
            }
        }
    });

    renderTicker();
}

function randomScoreUpdates() {
    games.forEach(game => {
        if (game.status !== "LIVE") return;

        const r = Math.random();
        if (r < TICK_PROBABILITY.touchdown) {
            if (Math.random() < 0.5) game.scoreA += 7;
            else game.scoreB += 7;
        } else if (r < TICK_PROBABILITY.touchdown + TICK_PROBABILITY.fieldGoal) {
            if (Math.random() < 0.5) game.scoreA += 3;
            else game.scoreB += 3;
        }
    });

    renderTicker();
}

/**************************************
 * ROTATION WITH FADE/SLIDE
 **************************************/
function rotateGames() {
    if (games.length <= 3) return;

    const slots = [0, 1, 2].map(i => document.getElementById(`game-${i}`));

    slots.forEach(slot => slot.classList.add("fade-out"));

    setTimeout(() => {
        visibleStartIndex += 3;
        if (visibleStartIndex >= games.length) visibleStartIndex = 0;

        renderTicker();

        slots.forEach(slot => {
            slot.classList.remove("fade-out");
            slot.classList.add("fade-in");
        });

        setTimeout(() => {
            slots.forEach(slot => slot.classList.remove("fade-in"));
        }, 500);
    }, 500);
}

/**************************************
 * DYNAMIC NEW GAMES
 **************************************/
function addNewGameFromNames(nameA, nameB) {
    if (games.length >= MAX_GAMES) return;

    games.push({
        teamA: nameA,
        teamB: nameB,
        scoreA: Math.floor(Math.random() * 7),
        scoreB: Math.floor(Math.random() * 7),
        quarter: 1,
        timeRemaining: 300,
        status: "LIVE"
    });
}

// simulate adding new games every 15s
setInterval(() => {
    if (games.length < MAX_GAMES && knownNames.length >= 2) {
        const names = [...knownNames].sort(() => 0.5 - Math.random());
        addNewGameFromNames(names[0], names[1]);
    }
}, 15000);

/**************************************
 * START
 **************************************/
renderTicker();
setInterval(tickGames, CLOCK_TICK_INTERVAL);
setInterval(randomScoreUpdates, SCORE_TICK_INTERVAL);
setInterval(rotateGames, GAME_ROTATION_INTERVAL);
