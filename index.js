const TOTAL_ROUNDS = 10;
const NEXT_QUESTION_DELAY = 2000;
const WORDS_FILE = "./words.json";

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const scoreScreen = document.getElementById("scoreScreen");

const btnPlay = document.getElementById("btnPlay");
const roundDetailsTxt = document.getElementById("roundDetails");
const scrambledWordTxt = document.getElementById("scrambledWord");
const btnAnswer = document.getElementById("btnAnswer");
const btnSkip = document.getElementById("btnSkip");
const answerField = document.getElementById("answerField");
const correctAnswerMsg = document.getElementById("correctAnswerMsg");
const correctAnswerTxt = document.getElementById("correctAnswer");
const correctAnswerFeedback = document.getElementById("correctAnswerFeedback");
const wrongAnswerFeedback = document.getElementById("wrongAnswerFeedback");
const loader = document.getElementById("loader");
const finalScoreTxt = document.getElementById("finalScore");
const btnPlayAgain = document.getElementById("btnPlayAgain");

const Screens = Object.freeze({
    HOME_SCREEN: 0,
    GAME_SCREEN: 1,
    SCORE_SCREEN: 2
});

let gameState = null;
let wordBank = null;

// ENTRY POINT
play();

function play() {
    document.addEventListener("DOMContentLoaded", () => {
        // Fetch word bank
        btnPlay.disabled = true;
        fetchWordBank(WORDS_FILE)
            .then(words => {
                wordBank = words;
                btnPlay.disabled = false;
            })
            .catch(err => {
                console.error("Error fetching words: ", err);
            });

        // Play button click
        btnPlay.addEventListener("click", () => startGame(wordBank, TOTAL_ROUNDS));

        // Answer button click
        btnAnswer.addEventListener("click", () => handleAnswer(gameState, NEXT_QUESTION_DELAY));

        // Skip button click
        btnSkip.addEventListener("click", () => handleNextWord(gameState));

        // Play Again button click
        btnPlayAgain.addEventListener("click", () => startGame(wordBank, TOTAL_ROUNDS));
    });
}

async function fetchWordBank(file) {
    try {
        const res = await fetch(file);
        const data = await res.json();
        return data.words;
    } catch (err) {
        console.error("Error fetching JSON: ", err);
        return [];
    }
}

function startGame(words, totalRounds) {
    if (!words) {
        console.log("Word bank is null.");
        return;
    }

    gameState = new GameState(getProcessedWords(words, totalRounds), totalRounds);
    changeScreen(Screens.GAME_SCREEN);
    handleNextWord(gameState);
}

function handleAnswer(gameState, nextQuestionDelay) {
    disableInputs();
    handleCheckAnswer(gameState.currentWord, answerField.value, () => gameState.increaseScore());
    displayLoader();

    setTimeout(() => handleNextWord(gameState), nextQuestionDelay);
}

function changeScreen(screen) {
    switch(screen) {
        case Screens.HOME_SCREEN:
            homeScreen.classList.remove("hidden");
            gameScreen.classList.add("hidden");
            scoreScreen.classList.add("hidden");
            break;
        case Screens.GAME_SCREEN:
            homeScreen.classList.add("hidden");
            gameScreen.classList.remove("hidden");
            scoreScreen.classList.add("hidden");
            break;
        case Screens.SCORE_SCREEN:
            homeScreen.classList.add("hidden");
            gameScreen.classList.add("hidden");
            scoreScreen.classList.remove("hidden");
            break;
    }
}

function getProcessedWords(words, count) {
    const shuffledWords = words.sort(() => Math.random() - 0.5);
    const selectedWords = shuffledWords.slice(0, count);

    return selectedWords.map(word => new Word(word));
}

function displayRoundNumber(round, totalRounds) {
    roundDetailsTxt.innerHTML = `${round} / ${totalRounds}`;
}

function displayWord(word) {
    scrambledWordTxt.innerHTML = word;
}

function disableInputs() {
    answerField.disabled = true;
    btnAnswer.disabled = true;
    btnSkip.disabled = true;
}

function enableInputs() {
    answerField.disabled = false;
    btnAnswer.disabled = false;
    btnSkip.disabled = false;
    answerField.focus();
}

function cleanPage() {
    answerField.value = "";
    correctAnswerFeedback.classList.add("hidden");
    wrongAnswerFeedback.classList.add("hidden");
    correctAnswerMsg.classList.add("hidden");
    loader.classList.add("hidden");
}

function handleCheckAnswer(word, answer, increaseScore) {
    if (word.checkAnswer(answer)) {
        increaseScore();
        correctAnswerFeedback.classList.remove("hidden");
    } else {
        wrongAnswerFeedback.classList.remove("hidden");
    }

    correctAnswerTxt.innerHTML = word.getWord();
    correctAnswerMsg.classList.remove("hidden");
}

function displayLoader() {
    loader.classList.remove("hidden");
}

function loadWord(word, round, totalRounds) {    
    enableInputs();
    cleanPage();

    displayRoundNumber(round, totalRounds);

    displayWord(word.getScrambledWord());
}

function handleNextWord(gameState) {
    if (gameState.isGameOver()) {
        handleGameOver(gameState.score);
        return;
    }

    const word = gameState.getNextWord();
    if (!word) {
        console.log("Word is null.");
        return;
    }
    loadWord(word, gameState.round, gameState.totalRounds);
}

function handleGameOver(finalScore) {
    changeScreen(Screens.SCORE_SCREEN);
    finalScoreTxt.innerHTML = finalScore;
}

class GameState {
    constructor(words, totalRounds) {
        this.words = words;
        this.totalRounds = totalRounds;
        this.round = 0;
        this.currentWord = null;
        this.score = 0;
    }

    getNextWord() {
        if (this.round >= this.words.length) {
            return null;
        }

        this.currentWord = this.words[this.round++];
        return this.currentWord;
    }

    isGameOver() {
        return this.round >= this.totalRounds;
    }

    increaseScore() {
        this.score += 10;
    }
}