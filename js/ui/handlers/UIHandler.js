/**
 * Base class for all UI handlers
 * Provides common functionality and structure for specialized UI handlers
 */
class UIHandler {
    constructor(game) {
        this.game = game;
    }

    /**
     * Initialize the handler and set up event listeners
     * Should be overridden by child classes
     */
    initialize() {
        // Override in child classes
    }

    /**
     * Format a number for input field display
     * @param {number} value - The value to format
     * @returns {string} The formatted string
     */
    formatNumberForInput(value) {
        if (value === undefined || value === null) return '';
        if (typeof value === 'number') {
            // For whole numbers, don't show decimal places
            if (Number.isInteger(value)) {
                return value.toString();
            }
            // For decimals, show up to 2 decimal places
            return value.toFixed(2).replace(/\.?0+$/, '');
        }
        return value.toString();
    }

    /**
     * Parse a number from input field value
     * @param {string} value - The input value
     * @returns {number} The parsed number
     */
    parseNumberFromInput(value) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Get an element by ID with error handling
     * @param {string} id - The element ID
     * @param {boolean} silent - If true, don't log warning for missing elements
     * @returns {HTMLElement|null} The element or null
     */
    getElementById(id, silent = false) {
        const element = document.getElementById(id);
        if (!element && !silent) {
            console.warn(`UIHandler: Element with id '${id}' not found`);
        }
        return element;
    }

    /**
     * Add event listener with error handling
     * @param {string} elementId - The element ID
     * @param {string} event - The event type
     * @param {Function} handler - The event handler
     * @param {boolean} silent - If true, don't log warning for missing elements
     */
    addListener(elementId, event, handler, silent = false) {
        const element = this.getElementById(elementId, silent);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    /**
     * Update an element's text content
     * @param {string} elementId - The element ID
     * @param {string} text - The text to set
     */
    updateText(elementId, text) {
        const element = this.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Update an element's innerHTML
     * @param {string} elementId - The element ID
     * @param {string} html - The HTML to set
     */
    updateHTML(elementId, html) {
        const element = this.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    }

    /**
     * Update an input element's value
     * @param {string} elementId - The element ID
     * @param {*} value - The value to set
     */
    updateValue(elementId, value) {
        const element = this.getElementById(elementId);
        if (element) {
            element.value = value;
        }
    }

    /**
     * Get an input element's value
     * @param {string} elementId - The element ID
     * @returns {string} The input value
     */
    getValue(elementId) {
        const element = this.getElementById(elementId);
        return element ? element.value : '';
    }

    /**
     * Show or hide an element
     * @param {string} elementId - The element ID
     * @param {boolean} show - Whether to show the element
     */
    showElement(elementId, show = true) {
        const element = this.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Enable or disable an element
     * @param {string} elementId - The element ID
     * @param {boolean} enable - Whether to enable the element
     */
    enableElement(elementId, enable = true) {
        const element = this.getElementById(elementId);
        if (element) {
            element.disabled = !enable;
        }
    }
}