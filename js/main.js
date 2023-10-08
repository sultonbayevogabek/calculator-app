'use strict';

// General functions
function getElement(selector, parentElement = document) {
    return parentElement?.querySelector(selector);
}

function getAllElements(selector, parentElement = document) {
    return parentElement?.querySelectorAll(selector);
}

function setLocalStorage(name, value) {
    localStorage.setItem(name, value);
}

function setAttribute(element, attributeName, value) {
    element?.setAttribute(attributeName, value);
}

function removeAttribute(element, attributeName) {
    element?.removeAttribute(attributeName);
}

// Themes
const elCurrentTheme = document.documentElement?.dataset?.theme;
const themeRadioInput = getElement(`.theme-switcher__radio[value='${elCurrentTheme}']`);
setAttribute(themeRadioInput, 'checked', true);

const elThemeSwitcherControlWrapper = getElement('.theme-switcher__control-wrapper');
const themes = ['dark', 'light', 'vintage'];

function playSwitchSound() {
    new Audio('../media/theme.mp3')?.play();
}

function playClickSound() {
    const sound = localStorage.getItem('sound') || 'on';
    if (sound === 'on') {
        new Audio('../media/click.mp3')?.play();
    }
}

function switchTheme() {
    const theme = getElement('input:checked', elThemeSwitcherControlWrapper)?.value;
    setAttribute(document.documentElement, 'data-theme', theme);
    setLocalStorage('theme', theme);
    playSwitchSound();
}

elThemeSwitcherControlWrapper?.addEventListener('change', switchTheme);

let themeChangeKeys = '';

function setThemeInputValue(key) {
    if (themeChangeKeys?.length === 0 && key === 'Alt') {
        themeChangeKeys = key;
        return;
    }

    if (themeChangeKeys?.length === 3 && [1, 2, 3].includes(+key)) {
        themeChangeKeys += key;
        const themeRadioInputs = getAllElements(`.theme-switcher__radio`);
        themeRadioInputs?.forEach(themeRadioInput => {
            removeAttribute(themeRadioInput, 'checked')
        });
        const checkingThemeRadioInput = getElement(`.theme-switcher__radio[value='${themes[+key - 1]}']`)
        setAttribute(checkingThemeRadioInput, 'checked', true);
        switchTheme();
        themeChangeKeys = '';
    }
}

let firstNumber = null;
let secondNumber = null;
let result = null;
let operator = null;
let history = [];
const calculatorKeyboard = getElement('.calculator__keyboard');
const calculatorDisplayInput = getElement('.calculator__input');
const calculatorKeyNumberButtons = getAllElements('.key--number', calculatorKeyboard);
const calculatorEqualButton = getElement('.key--equal', calculatorKeyboard);
const calculatorOperatorButtons = getAllElements('.key--operator', calculatorKeyboard);
const calculatorResetButton = getElement('.key--reset', calculatorKeyboard);
const calculatorDeleteButton = getElement('.key--del', calculatorKeyboard);
const historyButton = getElement('.key--history', calculatorKeyboard);
const historyClearButton = getElement('.history__clear button');
const historyLayer = getElement('.history');
const historyItemsWrapper = getElement('.history__items', historyLayer);
const soundButton = getElement('.key--sound', calculatorKeyboard);
const copyToClipboardButton = getElement('.calculator__copy');

function resetCalculator() {
    firstNumber = null;
    secondNumber = null;
    result = null;
    operator = null;
    calculatorDisplayInput.value = '';
}

function formatNumber(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function calculate() {
    if (!firstNumber || !secondNumber) {
        return;
    }
    firstNumber = firstNumber.replace(/[^\d.-]/g, '');
    secondNumber = secondNumber.replace(/[^\d.-]/g, '');
    switch (operator) {
        case '+':
            result = Number(firstNumber) + Number(secondNumber);
            break;
        case '-':
            result = Number(firstNumber) - Number(secondNumber);
            break;
        case 'x':
            result = Number(firstNumber) * Number(secondNumber);
            break;
        case '/':
            result = Number(firstNumber) / Number(secondNumber);
            break;
    }

    calculatorDisplayInput.value = formatNumber(result);

    history = JSON.parse(localStorage.getItem('history')) || [];
    history.push({
        firstNumber,
        operator,
        secondNumber,
        result
    })
    setLocalStorage('history', JSON.stringify(history));

    if (historyLayer.classList.contains('history--open')) {
        drawHistory(history);
    }

    firstNumber = null;
    secondNumber = null;
    operator = null;
}

calculatorResetButton.addEventListener('click', () => {
    resetCalculator();
    playClickSound();
});

calculatorKeyNumberButtons.forEach(numberButton => {
    numberButton.addEventListener('click', e => {
        let displayInputValue = calculatorDisplayInput.value;
        displayInputValue = displayInputValue.replace(/[^\d.-]/g, '');
        if (displayInputValue?.length === 10) {
            return;
        }
        if (displayInputValue === 'Infinity') {
            displayInputValue = '';
        }
        const number = e.target.textContent;
        let displayInputValueLength = calculatorDisplayInput.value?.length;

        if (!displayInputValueLength) {
            if (number === '.') {
                displayInputValue = '0.';
            } else {
                displayInputValue = number;
            }
        }

        if (displayInputValueLength) {
            if (number === '.' && displayInputValue.includes('.')) {
                return;
            }

            if (displayInputValue === '0' && number === '0') {
                return;
            }

            displayInputValue += number;
        }

        calculatorDisplayInput.value = formatNumber(displayInputValue);
        playClickSound();
    })
})

calculatorOperatorButtons.forEach(operatorButton => {
    operatorButton.addEventListener('click', e => {
        if (calculatorDisplayInput.value && !firstNumber) {
            operator = e.target.textContent;
            firstNumber = calculatorDisplayInput.value;
            calculatorDisplayInput.value = '';
        }
        if (calculatorDisplayInput.value && firstNumber) {
            secondNumber = calculatorDisplayInput.value;
            calculate();
        }
        playClickSound();
    })
})

calculatorEqualButton.addEventListener('click', () => {
    if (!firstNumber) {
        return;
    }
    secondNumber = calculatorDisplayInput.value;

    calculate()
    playClickSound();
})

calculatorDeleteButton.addEventListener('click', () => {
    let value = calculatorDisplayInput.value;
    calculatorDisplayInput.value = value.slice(0, value?.length - 1);
    playClickSound();
})

function drawHistory(history = []) {
    historyItemsWrapper.innerHTML = '';

    history.forEach(function (item) {
        historyItemsWrapper.innerHTML += `
                <div class="history__item">
                    <div>${item?.firstNumber} ${item?.operator} ${item?.secondNumber}</div>
                    <div>=</div>
                    <div>${item?.result}</div>
                </div>
                `
    })
}

historyButton.addEventListener('click', () => {
    historyLayer.classList.toggle('history--open');

    if (historyLayer.classList.contains('history--open')) {
        history = JSON.parse(localStorage.getItem('history')) || [];
        drawHistory(history);
    }
    playClickSound();
})

historyClearButton.addEventListener('click', () => {
    history = [];
    setLocalStorage('history', JSON.stringify(history));
    historyItemsWrapper.innerHTML = '';
    playClickSound();
})

const sound = localStorage.getItem('sound') || 'on';
setAttribute(soundButton, 'data-sound', sound);
soundButton.addEventListener('click', () => {
    let sound = localStorage.getItem('sound') || 'on';
    if (sound === 'on') {
        sound = 'off';
        setLocalStorage('sound', sound);
    } else {
        sound = 'on';
        setLocalStorage('sound', sound);
        playClickSound();
    }
    setAttribute(soundButton, 'data-sound', sound);
})

copyToClipboardButton.addEventListener('click', () => {
    navigator.clipboard.writeText(calculatorDisplayInput.value);
    playClickSound();
})

document.addEventListener('keydown', event => {
    const key = event.key;

    setThemeInputValue(key);

    if (key === 'Escape') {
        resetCalculator();
        return;
    }

    if (key === 'Backspace') {
        calculatorDeleteButton.click();
        return;
    }

    const keyNumber = +key;
    if (keyNumber >= 0 && keyNumber <= 9) {
        getElement(`[data-key="${keyNumber}"]`).click();
        getElement(`[data-key="${keyNumber}"]`).focus();
        return;
    }

    if (key === '.') {
        getElement(`[data-key="."]`).click();
        return;
    }

    if (['+', '-', '/', '*'].includes(key)) {
        getElement(`[data-operator="${key}"]`).click();
        return;
    }

    if (key === 'Enter') {
        event.preventDefault();
        calculatorEqualButton.click();
    }
})
