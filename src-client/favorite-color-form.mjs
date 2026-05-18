/*
 * Copyright (c) 2026 Brittni Watkins.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { StringUtility } from '../src-shared/string-utility.mjs';

import { ClientConstants } from './constants.mjs';

export class FaveColorFormHandler {
    /**
     * @type {string}
     */
    static #faveColorFormId = 'favorite-color-form';

    /**
     * @type {string}
     */
    static #nameInputId = 'name-input';

    /**
     * @type {string}
     */
    static #colorInputId = 'color-input';

    /**
     * @type {string}
     */
    static #colorPreviewId = 'color-preview-div';

    /**
     * @type {string}
     */
    static #formAlertDivId = 'form-alert-div';

    /**
     * @type {HTMLFormElement | null}
     */
    #faveColorForm = null;

    /**
     * @type {HTMLInputElement | null}
     */
    #nameInput = null;

    /**
     * @type {HTMLInputElement | null}
     */
    #colorInput = null;

    /**
     * @type {HTMLDivElement | null}
     */
    #colorPreviewDiv = null;

    /**
     * @type {HTMLDivElement | null}
     */
    #formAlertDiv = null;

    /**
     * The primary element ID for this handler.
     * If this element is present, the handler can initialize and manage the form.
     *
     * @returns {string}
     */
    static get primaryElementId() {
        return FaveColorFormHandler.#faveColorFormId;
    }

    /**
     * @returns {string}
     */
    static get invalidBackgroundColor() {
        return '#00000000';
    }

    /**
     * @returns {string}
     */
    static get defaultBackgroundColor() {
        return '#000000';
    }

    /**
     * @returns {string}
     */
    static get defaultFormSuccessAlert() {
        return 'Form submitted successfully! Thank you!';
    }

    /**
     * @returns {string}
     */
    static get defaultFormFailureAlert() {
        return 'Error submitting form. Please try again later.';
    }

    init() {
        this.#decorateHTML();
    }

    #decorateHTML() {
        this.#colorInput = document.getElementById(FaveColorFormHandler.#colorInputId);
        this.#colorPreviewDiv = document.getElementById(FaveColorFormHandler.#colorPreviewId);
        this.#nameInput = document.getElementById(FaveColorFormHandler.#nameInputId);
        this.#faveColorForm = document.getElementById(FaveColorFormHandler.#faveColorFormId);
        this.#formAlertDiv = document.getElementById(FaveColorFormHandler.#formAlertDivId);

        if (this.#faveColorForm) {
            this.#faveColorForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.#faveColorForm.classList.remove(ClientConstants.bootstrapValidatedFormClass);

                if (this.#faveColorForm.checkValidity() && this.#customFormValidation()) {
                    this.#faveColorForm.classList.add(ClientConstants.bootstrapValidatedFormClass);
                    this.#disableForm();
                    await this.#submitForm();
                } else {
                    this.#faveColorForm.classList.add(ClientConstants.bootstrapValidatedFormClass);
                }
            }, false);

            this.#faveColorForm.addEventListener('input', () => {
                if (this.#colorInput && this.#colorPreviewDiv) {
                    this.#updateColorPreview();
                }

                this.#validateForm();
            }, false);

            this.#faveColorForm.addEventListener('change', () => {
                if (this.#nameInput) {
                    this.#updateNameInput();
                }

                if (this.#colorInput && this.#colorPreviewDiv) {
                    this.#updateColorPreview();
                }

                this.#validateForm();
            }, false);
        }
    }

    #updateColorPreview() {
        if (this.#colorInput && this.#colorPreviewDiv) {
            const colorHex = this.#colorInput.value;

            if (StringUtility.isHexColorString(colorHex)) {
                this.#colorPreviewDiv.style.backgroundColor = colorHex;
            } else {
                this.#colorPreviewDiv.style.backgroundColor = FaveColorFormHandler.invalidBackgroundColor;
            }
        }
    }

    #updateNameInput() {
        if (this.#nameInput) {
            const nameValue = this.#nameInput.value;

            if (nameValue) {
                this.#nameInput.value = nameValue.trim();
            }
        }
    }

    #validateForm() {
        if (this.#faveColorForm) {
            this.#faveColorForm.classList.remove(ClientConstants.bootstrapValidatedFormClass);
            this.#faveColorForm.checkValidity();
            this.#customFormValidation();
            this.#faveColorForm.classList.add(ClientConstants.bootstrapValidatedFormClass);
        }
    }

    #customFormValidation() {
        if (this.#nameInput && this.#colorInput) {
            const isNameValid = this.#isValidNameInput();
            const isColorValid = this.#isValidColorInput();

            this.#setValidation(this.#nameInput, isNameValid, 'Please enter a valid name.');
            this.#setValidation(this.#colorInput, isColorValid, 'Please enter a valid hex color (i.e. #RRGGBB).');

            return isNameValid && isColorValid;
        }

        return false;
    }

    #setValidation(element, isValid, message) {
        if (element) {
            if (isValid) {
                element.setCustomValidity('');
            } else {
                element.setCustomValidity(message);
            }
        }
    }

    #disableForm() {
        const elements = document.getElementsByClassName(ClientConstants.disableToggleClass);

        Array.from(elements).forEach((element) => {
            element.disabled = true;
        });
    }

    #enableForm() {
        const elements = document.getElementsByClassName(ClientConstants.disableToggleClass);

        Array.from(elements).forEach((element) => {
            element.disabled = false;
        });
    }

    #resetForm() {
        if (this.#faveColorForm) {
            this.#faveColorForm.reset();
            this.#faveColorForm.classList.remove(ClientConstants.bootstrapValidatedFormClass);
        }

        if (this.#colorPreviewDiv) {
            this.#colorPreviewDiv.style.backgroundColor = FaveColorFormHandler.defaultBackgroundColor;
        }
    }

    /**
     * @param {boolean} success
     * @param {string|null|undefined} message
     */
    #formAlert(success, message) {
        if (this.#formAlertDiv) {
            this.#formAlertDiv.hidden = false;

            if (success) {
                this.#formSuccessAlert(message);
            } else {
                this.#formFailureAlert(message);
            }
        }
    }

    /**
     * @param {string|null|undefined} message
     */
    #formSuccessAlert(message) {
        if (this.#formAlertDiv) {
            this.#formAlertDiv.classList.remove(ClientConstants.bootstrapAlertDangerClass);
            this.#formAlertDiv.classList.add(ClientConstants.bootstrapAlertSuccessClass);
            this.#formAlertDiv.innerText = message || FaveColorFormHandler.defaultFormSuccessAlert;
        }
    }

    /**
     * @param {string|null|undefined} message
     */
    #formFailureAlert(message) {
        if (this.#formAlertDiv) {
            this.#formAlertDiv.classList.remove(ClientConstants.bootstrapAlertSuccessClass);
            this.#formAlertDiv.classList.add(ClientConstants.bootstrapAlertDangerClass);
            this.#formAlertDiv.innerText = message || FaveColorFormHandler.defaultFormFailureAlert;
        }
    }

    #clearFormAlert() {
        if (this.#formAlertDiv) {
            this.#formAlertDiv.classList.remove(ClientConstants.bootstrapAlertSuccessClass);
            this.#formAlertDiv.classList.remove(ClientConstants.bootstrapAlertDangerClass);
            this.#formAlertDiv.innerText = '';
            this.#formAlertDiv.hidden = true;
        }
    }

    /**
     * @returns {boolean}
     */
    #isValidNameInput() {
        if (!this.#nameInput) {
            return false;
        }

        return StringUtility.isSingleLineTrimmedString(this.#nameInput.value);
    }

    /**
     * @returns {boolean}
     */
    #isValidColorInput() {
        if (!this.#colorInput) {
            return false;
        }

        return StringUtility.isHexColorString(this.#colorInput.value);
    }

    /**
     * @returns {{name: string, color: string} | undefined}
     */
    #buildRequestBody() {
        if (this.#isValidNameInput() && this.#isValidColorInput()) {
            return {
                name: this.#nameInput.value,
                color: this.#colorInput.value
            };
        }

        return undefined;
    }

    /**
     * @return {Promise<void>}
     */
    async #submitForm() {
        let success = false;
        let alertMessage;
        const requestBody = this.#buildRequestBody();

        if (!requestBody) {
            alertMessage = 'Form fields missing or invalid. Please check your input and try again.';
        } else {
            try {
                const response = await fetch('/api/favoriteColor', {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(requestBody)
                });

                if (response?.ok) {
                    success = true;
                }

                try {
                    const data = await response?.json();
                    alertMessage = data?.message;
                } catch {
                    console.error('Could not parse JSON response.');
                }
            } catch {
                alertMessage = FaveColorFormHandler.defaultFormFailureAlert;
            }
        }

        this.#formAlert(success, alertMessage);

        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ClientConstants.tempDisplayTimeoutMillis);
        });

        this.#clearFormAlert();

        if (success) {
            this.#resetForm();
        }

        this.#enableForm();
    }
}
