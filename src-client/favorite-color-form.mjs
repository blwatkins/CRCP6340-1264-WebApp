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

// TODO - submit HTTP request
// TODO - display response for 5 seconds in form alert
// TODO - clear form on success; re-enable form on failure
// TODO - add linting for src-client and src-shared

import { StringUtility } from '../src-shared/string-utility.mjs';

import { ClientConstants } from './constants.mjs';

export class FaveColorFormHandler {
    static #faveColorFormId = 'favorite-color-form';
    static #nameInputId = 'name-input';
    static #colorInputId = 'color-input';
    static #colorPreviewId = 'color-preview-div';

    #faveColorForm;
    #nameInput;
    #colorInput;
    #colorPreview;

    static get primaryElementId() {
        return FaveColorFormHandler.#faveColorFormId;
    }

    static get defaultBackgroundColor() {
        return '#00000000';
    }

    init() {
        this.#decorateHTML();
    }

    #decorateHTML() {
        this.#colorInput = document.getElementById(FaveColorFormHandler.#colorInputId);
        this.#colorPreview = document.getElementById(FaveColorFormHandler.#colorPreviewId);
        this.#nameInput = document.getElementById(FaveColorFormHandler.#nameInputId);
        this.#faveColorForm = document.getElementById(FaveColorFormHandler.#faveColorFormId);

        if (this.#colorInput && this.#colorPreview) {
            this.#colorInput.addEventListener('input', this.#updateColorPreview.bind(this), false);
        }

        if (this.#nameInput) {
            this.#nameInput.addEventListener('change', this.#updateNameInput.bind(this), false);
        }

        if (this.#faveColorForm) {
            this.#faveColorForm.addEventListener('submit', async (event) => {
               event.preventDefault();
               event.stopPropagation();
                this.#faveColorForm.classList.remove(ClientConstants.bootstrapValidatedFormClass);

               if (this.#faveColorForm.checkValidity() && this.#customFormValidation()) {
                   this.#disableForm();
               }

               this.#faveColorForm.classList.add(ClientConstants.bootstrapValidatedFormClass);
            }, false);

            this.#faveColorForm.addEventListener('input', () => {
                this.#faveColorForm.classList.remove(ClientConstants.bootstrapValidatedFormClass);
                this.#faveColorForm.checkValidity();
                this.#customFormValidation()
                this.#faveColorForm.classList.add(ClientConstants.bootstrapValidatedFormClass);
            });
        }
    }

    #updateColorPreview() {
        if (this.#colorInput && this.#colorPreview) {
            const colorHex = this.#colorInput.value;

            if (StringUtility.isHexColorString(colorHex)) {
                this.#colorPreview.style.backgroundColor = colorHex;
            } else {
                this.#colorPreview.style.backgroundColor = FaveColorFormHandler.defaultBackgroundColor;
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
    }

    #formSuccessAlert() {

    }

    #formFailureAlert() {

    }

    #clearFormAlert() {

    }
}
