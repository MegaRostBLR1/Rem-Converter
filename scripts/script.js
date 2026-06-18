window.addEventListener('DOMContentLoaded', () => {
    const inputBase = document.querySelector('.input-base');
    const inputRem = document.querySelector('.input-rem');
    const inputPx = document.querySelector('.input-px');
    const buttonClear = document.querySelector('.button-clear');
    const error = document.querySelector('.input-error');
    const numericInputs = [inputBase, inputRem, inputPx];

    function sanitizeInput(value) {
        let result = '';
        let hasDot = false;

        for (const char of value) {
            if (char >= '0' && char <= '9') {
                result += char;
            } else if (char === '.' && !hasDot) {
                result += char;
                hasDot = true;
            }
        }

        return result;
    }

    function formatResult(num) {
        if (!Number.isFinite(num)) {
            return '';
        }

        return num.toFixed(4).replace(/\.0000$/, '');
    }

    function parseNumericValue(input) {
        const value = input.value.trim();

        if (value === '' || value === '.') {
            return NaN;
        }

        return parseFloat(value);
    }

    function applySanitizedInput(input) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const oldValue = input.value;
        const newValue = sanitizeInput(oldValue);

        if (oldValue !== newValue) {
            input.value = newValue;
            const diff = oldValue.length - newValue.length;
            input.setSelectionRange(
                Math.max(0, start - diff),
                Math.max(0, end - diff)
            );
        }
    }

    function getCopyValue(input) {
        const isFullSelection =
            input.selectionStart === 0 && input.selectionEnd === input.value.length;
        const selected = input.value.substring(input.selectionStart, input.selectionEnd);
        const cleanValue = sanitizeInput(selected || input.value);

        if (!cleanValue) {
            return '';
        }

        if (isFullSelection && input === inputPx) {
            return `${cleanValue}px;`;
        }

        if (isFullSelection && input === inputRem) {
            return `${cleanValue}rem;`;
        }

        return cleanValue;
    }

    function isBaseValid() {
        const baseValue = parseNumericValue(inputBase);

        return Number.isFinite(baseValue) && baseValue > 0;
    }

    function recalculateValues() {
        if (!isBaseValid()) {
            error.style.display = 'block';
            return;
        }

        error.style.display = 'none';

        const baseValue = parseNumericValue(inputBase);
        const remValue = parseNumericValue(inputRem);
        const pxValue = parseNumericValue(inputPx);
        const hasRem = inputRem.value !== '' && Number.isFinite(remValue);
        const hasPx = inputPx.value !== '' && Number.isFinite(pxValue);

        if (hasRem && hasPx) {
            inputRem.value = formatResult(pxValue / baseValue);
        } else if (hasPx) {
            inputRem.value = formatResult(pxValue / baseValue);
        } else if (hasRem) {
            inputPx.value = formatResult(remValue * baseValue);
        }
    }

    numericInputs.forEach((input) => {
        input.addEventListener('input', () => {
            applySanitizedInput(input);
        });

        input.addEventListener('copy', (event) => {
            const copyValue = getCopyValue(input);

            event.clipboardData.setData('text/plain', copyValue);
            event.preventDefault();
        });
    });

    inputBase.addEventListener('input', (event) => {
        if (event.target.value === '') {
            inputRem.value = '';
            inputPx.value = '';
            error.style.display = 'none';
        } else {
            recalculateValues();
        }
    });

    inputPx.addEventListener('input', (event) => {
        if (!isBaseValid()) {
            error.style.display = 'block';
            inputPx.value = '';
        } else {
            error.style.display = 'none';

            const pxValue = parseNumericValue(event.target);

            if (Number.isFinite(pxValue)) {
                inputRem.value = formatResult(pxValue / parseNumericValue(inputBase)) + 'rem;';
            }
        }

        if (inputPx.value === '') {
            inputRem.value = '';
        }
    });

    inputRem.addEventListener('input', (event) => {
        if (!isBaseValid()) {
            error.style.display = 'block';
            inputRem.value = '';
        } else {
            error.style.display = 'none';

            const remValue = parseNumericValue(event.target);

            if (Number.isFinite(remValue)) {
                inputPx.value = formatResult(remValue * parseNumericValue(inputBase)) + 'px;';
            }
        }

        if (inputRem.value === '') {
            inputPx.value = '';
        }
    });

    buttonClear.addEventListener('click', () => {
        inputBase.value = '';
        inputPx.value = '';
        inputRem.value = '';
        error.style.display = 'none';
    });
});
