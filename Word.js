class Word {
    constructor(word) {
        this.word = word.toUpperCase();
        this.scrambledWord = null;
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
        while (!this.scrambledWord || (this.word.length > 1 && this.word === this.scrambledWord)) {
            this.#shuffle();
        }

        return this.scrambledWord;
    }

    checkAnswer(answer) {
        return answer.trim().toUpperCase() === this.word;
    }
};