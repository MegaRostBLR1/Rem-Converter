window.addEventListener('DOMContentLoaded', () => {
    const inputBase = document.querySelector('.input-base');
    const inputPx = document.querySelector('.input-px');
    const inputRem = document.querySelector('.input-rem');
    const buttonClear = document.querySelector('.button-clear');
    const buttonHistoryClear = document.querySelector('.button-history-clear');
    const copyButtons = document.querySelectorAll('.button-copy');
    const error = document.querySelector('.input-error');
    const historyList = document.querySelector('.conversion-history__list');
    const numericInputs = [inputBase, inputPx, inputRem];

    function getInputUnit(input) {
        if (input === inputBase || input === inputPx) {
            return 'px';
        }

        if (input === inputRem) {
            return 'rem';
        }

        return '';
    }

    function sanitizeInput(value, input) {
        const unit = getInputUnit(input);
        const valueWithoutUnit = unit
            ? value.replace(new RegExp(unit + '$', 'i'), '')
            : value;
        let result = '';
        let hasDecimalPoint = false;

        for (const char of valueWithoutUnit) {
            if (char >= '0' && char <= '9') {
                result += char;
            } else if (char === '.' && !hasDecimalPoint) {
                result += char;
                hasDecimalPoint = true;
            }
        }

        return unit && result ? result + unit : result;
    }

    function formatResult(value, unit = '') {
        if (!Number.isFinite(value)) {
            return '';
        }

        const formattedValue = value.toFixed(4).replace(/\.?0+$/, '');

        return formattedValue + unit;
    }

    function getNumericValue(input) {
        const value = input.value
            .trim()
            .replace(/(px|rem)$/i, '');

        if (!value || value === '.') {
            return NaN;
        }

        return Number(value);
    }

    function isBaseValid() {
        const baseValue = getNumericValue(inputBase);

        return Number.isFinite(baseValue) && baseValue > 0;
    }

    const HISTORY_STORAGE_KEY = 'rem-converter-history';

    function getHistory() {
        try {
            const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY));
            return Array.isArray(history) ? history : [];
        } catch {
            return [];
        }
    }

    function renderHistory(history = getHistory()) {
        historyList.replaceChildren();

        history.forEach(({px, rem}) => {
            const item = document.createElement('div');
            const value = document.createElement('span');
            const copyButton = document.createElement('button');
            const remValue = rem + 'rem';

            item.className = 'conversion-history__item';
            value.textContent = px + 'px = ' + remValue;
            copyButton.className = 'button-history-copy';
            copyButton.type = 'button';
            copyButton.setAttribute('aria-label', 'Копировать ' + remValue);
            copyButton.title = 'Копировать значение';
            copyButton.dataset.copyValue = remValue;
            copyButton.innerHTML = `
                <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                    <rect x="8" y="8" width="11" height="11" rx="2"></rect>
                    <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2 2h8a2 2 0 0 1 2 2v1"></path>
                </svg>
            `;

            item.append(value, copyButton);
            historyList.append(item);
        });
    }

    function saveCurrentConversion() {
        const pxValue = getNumericValue(inputPx);
        const remValue = getNumericValue(inputRem);

        if (!Number.isFinite(pxValue) || !Number.isFinite(remValue)) {
            return;
        }

        const px = formatResult(pxValue);
        const rem = formatResult(remValue);
        const history = getHistory();
        const isDuplicate = history.some((item) => item.px === px && item.rem === rem);

        if (isDuplicate) {
            return;
        }

        history.push({px, rem});
        history.sort((a, b) => Number(b.px) - Number(a.px));

        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
            renderHistory(history);
        } catch {
            return;
        }
    }

    let saveTimer;

    function scheduleSave() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveCurrentConversion, 2000);
    }

    function setError(isVisible) {
        error.classList.toggle('is-visible', isVisible);
    }

    function sanitizeInputValue(input) {
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        const oldValue = input.value;
        const newValue = sanitizeInput(oldValue, input);

        if (oldValue === newValue) {
            return;
        }

        input.value = newValue;
        input.setSelectionRange(
            Math.min(start, newValue.length),
            Math.min(end, newValue.length)
        );
    }

    function clearConvertedValue(input) {
        input.value = '';
    }

    function convertFromPx() {
        if (!isBaseValid()) {
            clearConvertedValue(inputRem);
            setError(true);
            return;
        }

        const pxValue = getNumericValue(inputPx);

        if (!Number.isFinite(pxValue)) {
            clearConvertedValue(inputRem);
            return;
        }

        inputRem.value = formatResult(pxValue / getNumericValue(inputBase), 'rem');
        setError(false);
    }

    function convertFromRem() {
        if (!isBaseValid()) {
            clearConvertedValue(inputPx);
            setError(true);
            return;
        }

        const remValue = getNumericValue(inputRem);

        if (!Number.isFinite(remValue)) {
            clearConvertedValue(inputPx);
            return;
        }

        inputPx.value = formatResult(remValue * getNumericValue(inputBase), 'px');
        setError(false);
    }

    function convertFromBase() {
        if (!inputBase.value.trim()) {
            clearConvertedValue(inputPx);
            clearConvertedValue(inputRem);
            setError(false);
            return;
        }

        if (!isBaseValid()) {
            setError(true);
            return;
        }

        if (inputPx.value.trim()) {
            convertFromPx();
            return;
        }

        if (inputRem.value.trim()) {
            convertFromRem();
            return;
        }

        setError(false);
    }

    async function copyInputValue(input, button) {
        const value = input.value.trim();

        if (!value) {
            return;
        }

        try {
            await navigator.clipboard.writeText(value);
        } catch {
            const textArea = document.createElement('textarea');

            textArea.value = value;
            textArea.setAttribute('readonly', '');
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.append(textArea);
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }

        button.classList.add('is-copied');
        button.dataset.tooltip = 'Скопировано';
        button.setAttribute('aria-label', 'Значение скопировано');
        button.setAttribute('title', 'Значение скопировано');

        setTimeout(() => {
            button.classList.remove('is-copied');
            delete button.dataset.tooltip;
            button.setAttribute('aria-label', 'Копировать значение');
            button.setAttribute('title', 'Копировать значение');
        }, 1000);
    }

    numericInputs.forEach((input) => {
        input.addEventListener('input', () => {
            sanitizeInputValue(input);
        });
    });

    copyButtons.forEach((button) => {
        const input = document.getElementById(button.dataset.copyTarget);

        button.addEventListener('click', () => {
            copyInputValue(input, button);
        });
    });

    historyList.addEventListener('click', async (event) => {
        const button = event.target.closest('.button-history-copy');

        if (!button) {
            return;
        }

        const value = button.dataset.copyValue;

        try {
            await navigator.clipboard.writeText(value);
        } catch {
            const textArea = document.createElement('textarea');

            textArea.value = value;
            textArea.setAttribute('readonly', '');
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.append(textArea);
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }

        button.classList.add('is-copied');
        button.dataset.tooltip = 'Скопировано';
        button.setAttribute('aria-label', 'Значение скопировано');
        button.title = 'Значение скопировано';

        setTimeout(() => {
            button.classList.remove('is-copied');
            delete button.dataset.tooltip;
            button.setAttribute('aria-label', 'Копировать ' + value);
            button.title = 'Копировать значение';
        }, 1000);
    });

    buttonHistoryClear.addEventListener('click', () => {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        renderHistory([]);
    });

    renderHistory();

    inputBase.addEventListener('input', convertFromBase);
    inputPx.addEventListener('input', () => {
        convertFromPx();
        scheduleSave();
    });
    inputRem.addEventListener('input', () => {
        convertFromRem();
        scheduleSave();
    });

    buttonClear.addEventListener('click', () => {
        numericInputs.forEach((input) => {
            input.value = '';
        });

        setError(false);
        inputBase.focus();
    });
});