/* global Log, Module */

/* Magic Mirror
 * Module: MMM-Shairportsync-color
 *
 * By Dr. S. Debbarma
 * MIT Licensed.
 */

Module.register("MMM-Shairportsync-color", {
    defaults: {
        brightnessFactor: 1.0, // Default brightness factor
        paletteIndex: "primary", // Default color name (mapped to palette index)
        brightnessOverrides: { // Adjustments for specific text types
            dimmed: 1.2, // Slightly brighter for dimmed text
            small: 1.4, // Brighter for small text
            extraSmall: 1.6 // Even brighter for extra-small text
        }
    },

    start: function () {
        Log.info("Starting module: " + this.name);
    },

    notificationReceived: function (notification, payload) {
        if (notification === "DATA_BROADCAST") {
            // Send image data to node_helper for processing
            this.sendSocketNotification("PROCESS_IMAGE", payload.image);
        }
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "COLOR_PALETTE") {
            Log.info("Received color palette from Python:");
            console.log(payload); // Log the palette for debugging

            // Update the text colors based on the color palette
            this.updateTextColors(payload);
        }
    },

    updateTextColors: function (palette) {
        const colorIndex = this.getColorIndex(this.config.paletteIndex);
        if (colorIndex === null || !palette[colorIndex]) {
            Log.error("Invalid palette index or name. Using default color.");
            return;
        }

        const selectedColor = palette[colorIndex];
        const rgb = `rgb(${selectedColor[0]}, ${selectedColor[1]}, ${selectedColor[2]})`;

        // Inject new CSS to modify the text colors based on the extracted color
        this.injectTextColorsCSS(rgb);
    },

    getColorIndex: function (colorName) {
        const colorMapping = {
            primary: 0,
            secondary: 1,
            accent: 2,
            highlight: 3
        };

        return colorMapping[colorName] !== undefined ? colorMapping[colorName] : null;
    },

    injectTextColorsCSS: function (baseColor) {
        const brightnessFactor = this.config.brightnessFactor;
        const overrides = this.config.brightnessOverrides;

        const css = `
            :root {
                --color-text: ${this.adjustBrightness(baseColor, brightnessFactor)} !important;
                --color-text-dimmed: ${this.adjustBrightness(baseColor, overrides.dimmed || brightnessFactor)} !important;
                --color-text-small: ${this.adjustBrightness(baseColor, overrides.small || brightnessFactor)} !important;
                --color-text-extra-small: ${this.adjustBrightness(baseColor, overrides.extraSmall || brightnessFactor)} !important;
            }
            /* Apply specific brightness adjustments */
            .dimmed {
                color: var(--color-text-dimmed) !important;
            }
            .small-text {
                color: var(--color-text-small) !important;
            }
            .extra-small-text {
                color: var(--color-text-extra-small) !important;
            }
        `;
        const style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);
    },

    adjustBrightness: function (rgb, factor) {
        let [r, g, b] = rgb.replace(/^rgb\(|\s+|\)$/g, '').split(',').map(Number);
        r = Math.min(255, Math.max(0, r * factor));
        g = Math.min(255, Math.max(0, g * factor));
        b = Math.min(255, Math.max(0, b * factor));

        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
});
