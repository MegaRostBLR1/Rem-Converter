window.addEventListener('DOMContentLoaded', () => {
    const inputBase = document.querySelector('.input-base');
    const inputRem = document.querySelector('.input-rem');
    const inputPx = document.querySelector('.input-px');
    const buttonClear = document.querySelector('.button-clear');
    const error = document.querySelector('.input-error');

    inputPx.addEventListener('input', (event) => {
        if (isNaN(inputBase.value) || inputBase.value <= 0) {
            error.style.display = 'block';
            inputPx.value = '';
        } else {
            error.style.display = 'none';
            const pxValue = event.target.value;
            inputRem.value = (pxValue / inputBase.value).toFixed(4);
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
            const remValue = event.target.value;
            inputPx.value = (remValue * inputBase.value).toFixed(4);
        }

        if (inputRem.value === '') {
            inputPx.value = '';
        }
    })

    function clearInput() {
        inputPx.value = '';
        inputRem.value = '';
    }

    buttonClear.addEventListener('click', clearInput);
})