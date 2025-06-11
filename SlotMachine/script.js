// Slot Machine Values
const ROWS = 3;
const COLS = 3;

const SYMBOLS_COUNT = {
    "A": 2,
    "B": 4,
    "C": 6,
    "D": 8
}

const SYMBOL_VALUES = {
    "A": 5,
    "B": 4,
    "C": 3,
    "D": 2
}

const SYMBOL_COLORS = {
    "A": "green",
    "B": "yellow",
    "C": "orange",
    "D": "red"
}

let balance = 100
const balanceElement = document.getElementById("current-balance");
balanceElement.innerHTML = balance.toString();
let bet;


function getBettingValue() {
    const inputElement = document.getElementById("myInput");
    const bettingAmount = parseFloat(inputElement.value);

    if (isNaN(bettingAmount) || bettingAmount <= 0 || bettingAmount > balance) {
        document.getElementById("output").innerText = "You must enter a valid betting amount!";
        console.log(bettingAmount);
    } else {
        document.getElementById("output").innerText = "You're betting €" + bettingAmount;
        console.log(bettingAmount);

        // Displaying hidden slotmachine
        const spinButton = document.getElementById("spin-button");
        const slotMachine = document.getElementById("slot-machine")
        const slots = document.querySelectorAll(".slot")
        spinButton.style.display = "block";
        slotMachine.style.display = "flex";
        slots.forEach(slot => {
            slot.style.display = "block";
        })
        bet = bettingAmount;
    }
}

function spin() {
    const symbols = [];
    balance -= bet;
    for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
        for (let i = 0; i < count; i++) {
            symbols.push(symbol);
        }
    }

    const reels = [];
    for (let i = 0; i < COLS; i++) {
        reels.push([])
        const reelSymbols = [...symbols];
        for (let j =0; j < ROWS; j++) {
            const randomIndex = Math.floor(Math.random() * reelSymbols.length);
            const selectedSymbol = reelSymbols[randomIndex];
            reels[i].push(selectedSymbol);
            reelSymbols.splice(randomIndex, 1);
        }
    }

    // Changing the button name to spin again and reminder of how much you're betting
    const spinButton = document.getElementById("spin-button");
    spinButton.innerHTML = "Spin Again?";
    const betReminder = document.getElementById("output");
    betReminder.innerHTML = "You're still betting €" + bet.toString();
    return reels
};

const transpose = (reels) => {
    const rows = [];
    for (let i = 0; i < ROWS; i ++) {
        rows.push([]);
        for (let j = 0; j < COLS; j++) {
            rows[i].push(reels[j][i]);
        }
    }

    return rows;
};

const displayResult = (rows) => {
    const slots = document.querySelectorAll(".slot");
    for (i = 0; i < ROWS; i++) {
        for (j = 0; j < COLS; j++) {
            const slotNumber = 3*j + i;
            slots[slotNumber].innerHTML = rows[j][i];
            slots[slotNumber].style.backgroundColor = SYMBOL_COLORS[rows[j][i]];
        }
    }
};

const checkWinnings = (rows) => {
    console.log(rows);
    let winnings = 0;
    for (let row = 0; row < ROWS; row++) {
        const symbols = rows[row];
        let allSame = true;

        for (const symbol of symbols) {
            if (symbol != symbols[0]) {
                allSame = false;
                break;
            }
        }

        if (allSame) {
            winnings += bet * SYMBOL_VALUES[symbols[0]];
        }
    }

    return winnings;
};

const displayWinnings = (winnings) => {
    const display = document.getElementById("winnings-display");
    display.innerHTML = "You won €" + winnings.toString();
    balance += winnings;
    balanceElement.innerHTML = balance.toString();
};

const checkLoss = () => {
    if (balance <= 0) {
        const lossElement = document.getElementById("winnings-display");
        lossElement.innerHTML = "You have run out of dabloons. You Lose!"
    }
}

function play() {
    const reels = spin();
    const rows = transpose(reels);
    displayResult(rows);
    const winnings = checkWinnings(rows);
    displayWinnings(winnings);
    checkLoss();
};