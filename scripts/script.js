window.addEventListener('DOMContentLoaded', () => {
    const inputBase = document.querySelector('.input-base');
    const inputRem = document.querySelector('.input-rem');
    const inputPx = document.querySelector('.input-px');
    const buttonClear = document.querySelector('.button-clear');
    const error = document.querySelector('.input-error');

    function recalculateValues () {
        if (isNaN(inputBase.value) || inputBase.value <= 0) {
            error.style.display = 'block';
            return;
        } else {
            error.style.display = 'none';
        }

        const hasRem = inputRem.value && !isNaN(inputRem.value);
        const hasPx = inputPx.value && !isNaN(inputPx.value);

        if (hasRem && hasPx) {
            inputRem.value = (inputPx.value / inputBase.value).toFixed(4);
        }

        else if (hasPx) {
            inputRem.value = (inputPx.value / inputBase.value).toFixed(4);
        }

        else if (hasRem) {
            inputPx.value = (inputRem.value * inputBase.value).toFixed(4);
        }
    }

    inputBase.addEventListener('input', (event) => {
        if (event.target.value === '') {
            inputRem.value = '';
            inputPx.value = '';
            error.style.display = 'none';
        } else {
            recalculateValues();
        }
    })

    inputPx.addEventListener('input', (event) => {
        if (isNaN(inputBase.value) || inputBase.value <= 0) {
            error.style.display = 'block';
            inputPx.value = '';
        } else {
            error.style.display = 'none';
            inputRem.value = (event.target.value / inputBase.value).toFixed(4);
        }

        if (inputPx.value === '') {
            inputRem.value = '';
        }
    })

    inputRem.addEventListener('input', (event) => {
        if (isNaN(inputBase.value) || inputBase.value <= 0) {
            error.style.display = 'block';
            inputRem.value = '';
        } else {
            error.style.display = 'none';
            inputPx.value = (event.target.value * inputBase.value).toFixed(4);
        }

        if (inputRem.value === '') {
            inputPx.value = '';
        }
    })

    buttonClear.addEventListener('click', () => {
        inputBase.value = '';
        inputPx.value = '';
        inputRem.value = '';
        error.style.display = 'none';
    });
})