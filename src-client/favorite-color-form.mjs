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

// TODO - add linting for src-client and src-shared

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
     * @type {HTMLFormElement | undefined}
     */
    #faveColorForm;

    /**
     * @type {HTMLInputElement | undefined}
     */
    #nameInput;

    /**
     * @type {HTMLInputElement | undefined}
     */
    #colorInput;

    /**
     * @type {HTMLDivElement | undefined}
     */
    #colorPreviewDiv;

    /**
     * @type {HTMLDivElement | undefined}
     */
    #formAlertDiv;

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
                return;
            }
        }

        this.#colorPreviewDiv.style.backgroundColor = FaveColorFormHandler.invalidBackgroundColor;
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
            const isNameValid = StringUtility.isSingleLineTrimmedString(this.#nameInput.value);
            const isColorValid = StringUtility.isHexColorString(this.#colorInput.value);

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

    #formSuccessAlert(message) {
        if (this.#formAlertDiv) {
            this.#formAlertDiv.classList.add(ClientConstants.bootstrapAlertSuccessClass);
            this.#formAlertDiv.innerText = message || FaveColorFormHandler.defaultFormSuccessAlert;
        }
    }

    #formFailureAlert(message) {
        if (this.#formAlertDiv) {
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

    #buildRequestBody() {
        if (this.#nameInput && this.#colorInput) {
            // TODO - check for valid name and color in method

            return {
                name: this.#nameInput.value,
                color: this.#colorInput.value,
            }
        }

        return undefined;
    }

    async #submitForm() {
        let success = false;
        let alertMessage;
        const requestBody = this.#buildRequestBody();

        if (!requestBody) {
            alertMessage = 'This form is not properly formatted to submit this request.';
        } else {
            try {
                const response = await fetch('/api/favoriteColor', {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(requestBody)
                });

                if (response) {
                    if (response.ok) {
                        success = true;
                    }

                    const data = await response.json();
                    alertMessage = data?.message;
                } else {
                    alertMessage = FaveColorFormHandler.defaultFormFailureAlert;
                }
            } catch (error) {
                alertMessage = FaveColorFormHandler.defaultFormFailureAlert;
            }
        }

        this.#formAlert(success, alertMessage);

        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 3_000);
        });

        this.#clearFormAlert();

        if (success) {
            this.#resetForm();
        }

        this.#enableForm();
    }
}
