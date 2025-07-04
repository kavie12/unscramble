const ROUND_COUNT = 10;
const WORDLIST = [
    "Mango",
    "Banana",
    "Chair",
    "Laptop",
    "Car",
    "Bottle",
    "Tree",
    "Water",
    "Light",
    "Book"
];

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");

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

document.addEventListener("DOMContentLoaded", () => {

    const btnPlay = document.getElementById("btnPlay");

    // Play button click
    btnPlay.addEventListener("click", () => {
        let round = 0;

        displayGameScreen();

        const words = WORDLIST.map(word => new Word(word));
        loadWord(words, round);
    });

});

function displayGameScreen() {
    homeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
}

async function fetchWords(file, count) {
    try {
        const res = await fetch(file);
        const data = await res.json();

        const shuffledWords = data.words.sort(() => Math.random() - 0.5);
        const selectedWords = shuffledWords.slice(0, count);

        return selectedWords.map(word => new Word(word))
    } catch (err) {
        console.error("Error fetching JSON: ", err);
        return [];
    }
}

function updateRoundNumber(round, totalRounds) {
    roundDetailsTxt.innerHTML = `${round} / ${totalRounds}`;
}

function displayWord(word) {
    scrambledWordTxt.innerHTML = word;
}

function preventKeydown(e) {
    e.preventDefault();
}

function disableInputs() {
    answerField.addEventListener("keydown", preventKeydown);
    btnAnswer.disabled = true;
    btnSkip.disabled = true;
}

function enableInputs() {
    answerField.removeEventListener("keydown", preventKeydown);
    btnAnswer.disabled = false;
    btnSkip.disabled = false;
}

function cleanPage() {
    answerField.value = "";
    correctAnswerFeedback.classList.add("hidden");
    wrongAnswerFeedback.classList.add("hidden");
    correctAnswerMsg.classList.add("hidden");
    loader.classList.add("hidden");
}

function handleCheckAnswer(word, answer) {
    if (word.checkAnswer(answer)) {
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

function loadWord(words, round) {    
    enableInputs();
    cleanPage();

    const word = words[round];
    round++;
    updateRoundNumber(round, ROUND_COUNT);

    displayWord(word.getScrambledWord());

    // Answer button click
    btnAnswer.addEventListener("click", () => {
        disableInputs();
        handleCheckAnswer(word, answerField.value);
        displayLoader();

        if (round < ROUND_COUNT) {
            setTimeout(() => loadWord(words, round), 2000);
        }
    });
}

class Word {
    constructor(word) {
        this.word = word.toUpperCase();
        this.scrambledWord = null;
        this.isDone = false;
        this.isCorrect = false;
    }

    getWord() {
        return this.word;
    }

    #shuffle() {
        // Fisher-Yates Shuffle
        
        const chars = this.word.split('');
        
        for (let i = chars.length - 1; i > 0; i--) {
            let rand = Math.floor(Math.random() * (i + 1));

            [chars[i], chars[rand]] = [chars[rand], chars[i]];
        }

        this.scrambledWord = chars.join('');
    }

    getScrambledWord() {
        while (this.scrambledWord == null) {
            this.#shuffle();
        }

        return this.scrambledWord;
    }

    checkAnswer(answer) {
        this.isDone = true;
        if (answer.toUpperCase() === this.word) {
            this.isCorrect = true;
            return true;
        }
        return false;
    }
};