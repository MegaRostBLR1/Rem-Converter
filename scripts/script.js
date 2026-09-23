window.addEventListener('DOMContentLoaded', () => {
    const inputBase = document.querySelector('.input-base');
    const inputPx = document.querySelector('.input-px');
    const inputRem = document.querySelector('.input-rem');
    const buttonClear = document.querySelector('.button-clear');
    const error = document.querySelector('.input-error');
    const numericInputs = [inputBase, inputPx, inputRem];

    function sanitizeInput(value) {
        let result = '';
        let hasDecimalPoint = false;

        for (const char of value) {
            if (char >= '0' && char <= '9') {
                result += char;
            } else if (char === '.' && !hasDecimalPoint) {
                result += char;
                hasDecimalPoint = true;
            }
        }

        return result;
    }

    function formatResult(value) {
        if (!Number.isFinite(value)) {
            return '';
        }

        return value.toFixed(4).replace(/\.0000$/, '');
    }

    function getNumericValue(input) {
        const value = input.value.trim();

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
        const newValue = sanitizeInput(oldValue);

        if (oldValue === newValue) {
            return;
        }

        const removedBeforeCursor = oldValue
            .slice(0, start)
            .length - newValue.slice(0, start).length;

        input.value = newValue;
        input.setSelectionRange(
            Math.max(0, start - removedBeforeCursor),
            Math.max(0, end - removedBeforeCursor)
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

        inputRem.value = formatResult(pxValue / getNumericValue(inputBase));
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

        inputPx.value = formatResult(remValue * getNumericValue(inputBase));
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

    function getCopyValue(input, unit) {
        const isFullSelection =
            input.selectionStart === 0 &&
            input.selectionEnd === input.value.length;
        const selectedValue = input.value.substring(
            input.selectionStart ?? 0,
            input.selectionEnd ?? input.value.length
        );
        const value = sanitizeInput(selectedValue || input.value);

        if (!value) {
            return '';
        }

        return isFullSelection ? `${value}${unit};` : value;
    }

    numericInputs.forEach((input) => {
        input.addEventListener('input', () => {
            sanitizeInputValue(input);
        });

        input.addEventListener('copy', (event) => {
            const unit = input === inputPx ? 'px' : input === inputRem ? 'rem' : '';
            const copyValue = getCopyValue(input, unit);

            event.clipboardData.setData('text/plain', copyValue);
            event.preventDefault();
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
