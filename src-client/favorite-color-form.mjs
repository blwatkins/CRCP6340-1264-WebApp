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

// TODO - validate that colorInput is hex (#RRGGBB)
// TODO - validate name is single line text
// TODO - validate form
// TODO - disable form
// TODO - submit HTTP request
// TODO - display response for 5 seconds
// TODO - clear form on success; re-enable form on failure

export class FaveColorFormHandler {
    static #favoriteColorFormId = 'favorite-color-form';
    static #nameInputId = 'name-input';
    static #colorInputId = 'color-input';
    static #colorPreviewId = 'color-preview-div';

    #colorInput;
    #colorPreview;

    static get primaryElementId() {
        return FaveColorFormHandler.#favoriteColorFormId;
    }

    init() {
        this.#decorateHTML();
    }

    #decorateHTML() {
        this.#colorInput = document.getElementById(FaveColorFormHandler.#colorInputId);
        this.#colorPreview = document.getElementById(FaveColorFormHandler.#colorPreviewId);

        if (this.#colorInput && this.#colorPreview) {
            this.#colorInput.addEventListener('input', this.#updateColorPreview.bind(this));
        }
    }

    #updateColorPreview() {
        if (this.#colorInput && this.#colorPreview) {
            const colorHex = this.#colorInput.value;
            console.log(colorHex);
            this.#colorPreview.style.backgroundColor = colorHex;
        }
    }
}
