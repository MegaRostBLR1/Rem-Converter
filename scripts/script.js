window.addEventListener('DOMContentLoaded', () => {
    const inputBase = document.querySelector('.input-base');
    const inputPx = document.querySelector('.input-px');
    const inputRem = document.querySelector('.input-rem');
    const buttonClear = document.querySelector('.button-clear');
    const copyButtons = document.querySelectorAll('.button-copy');
    const error = document.querySelector('.input-error');
    const numericInputs = [inputBase, inputPx, inputRem];

    function getInputUnit(input) {
        if (input === inputPx) {
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

        const formattedValue = value.toFixed(4).replace(/\.0000$/, '');

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
        button.setAttribute('aria-label', 'Значение скопировано');
        button.setAttribute('title', 'Значение скопировано');

        setTimeout(() => {
            button.classList.remove('is-copied');
            button.setAttribute('aria-label', 'Копировать значение');
            button.setAttribute('title', 'Копировать значение');
        }, 1200);
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

    inputBase.addEventListener('input', convertFromBase);
    inputPx.addEventListener('input', convertFromPx);
    inputRem.addEventListener('input', convertFromRem);

    buttonClear.addEventListener('click', () => {
        numericInputs.forEach((input) => {
            input.value = '';
        });

        setError(false);
        inputBase.focus();
    });
});