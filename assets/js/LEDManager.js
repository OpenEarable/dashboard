function hexToRgb(hex) {
    // Remove the hash at the start if it's there
    hex = hex.charAt(0) === '#' ? hex.substring(1) : hex;

    // Parse r, g, b values
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    return { r: r, g: g, b: b };
}

function onSetColor() {
    stopRainbowMode();

    let hexValue = $('#colorpicker').val();
    let rgbValue = hexToRgb(hexValue);
    openEarable.rgbLed.writeLedColor(rgbValue.r, rgbValue.g, rgbValue.b);
}

function onTurnOffLed() {
    stopRainbowMode();
    
    openEarable.rgbLed.writeLedColor(0, 0, 0);
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        let hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

let rainbowInterval;
let rainbowModeActive = false;

function startRainbowMode() {
    if (rainbowModeActive) return;

    rainbowModeActive = true;

    let h = 0;
    const increment = 0.01; // Controls the speed of the rainbow effect. Adjust as needed.

    rainbowInterval = setInterval(() => {
        let rgbValue = hslToRgb(h, 1, 0.5); // Maximum saturation and mid luminance
        openEarable.rgbLed.writeLedColor(rgbValue.r, rgbValue.g, rgbValue.b);

        h += increment;
        if (h > 1) h = 0; // Reset hue value
    }, 200); // Adjust interval for speed as well, e.g., 100ms
}

function stopRainbowMode() {
    rainbowModeActive = false;

    clearInterval(rainbowInterval);
}

function isValidHex(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

const colorPicker = document.getElementById('colorpicker');
const colorInput = document.getElementById('colorInput');

// Function to set the text input based on the color picker value
function setColorInputValue() {
    colorInput.value = colorPicker.value;
}

colorPicker.addEventListener('input', setColorInputValue);

colorInput.addEventListener('blur', function() {
    if (!isValidHex(this.value)) {
        setColorInputValue(); // Reset to the color picker value if the entered value isn't valid
    } else {
        colorPicker.value = this.value; // Update color picker if the value is valid
    }
});

// Populate the text input with the color picker value when the page loads
setColorInputValue();