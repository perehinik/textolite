/**
 * @module ColorToolset - Module contains types and tools for working with colors.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

/**
 * Color type definition.
 * 
 * @param R - Red 0-255.
 * @param G - Green 0-255.
 * @param B - Blue 0-255.
 * @param opacity - 0-1, 0-transparent.
 * @param brightness - -1-1. -1=black, 1=white.
 */ 
export type Color = {
    R: number,
    G: number,
    B: number,
    opacity?: number,
    brightness?: number
};

/**
 * Array of main colors supported by color panel.
 */ 
export const standartColors: Color[] = getColors();

/**
 * Build array with standart colors.
 * 
 * @returns Array with standart colors.
 */ 
export function getColors(): Color[] {
    const gradient: number[] = [0, 0, 0, 0, 0, 128, 255, 255, 255, 255, 255, 128];
    const colors: Color[] = [];
    for(let i = 0; i < gradient.length; i++) {
        colors.push({
            R: gradient[i],
            G: gradient[(i + 4) % gradient.length],
            B: gradient[(i + 8) % gradient.length],
            opacity: 1,
            brightness: 0
        });
    }
    colors.push({ R: 128, G: 128, B: 128, opacity: 1 });
    return colors;
}

/**
 * Convert color object to color string.
 * 
 * @param color - Color object.
 * @returns - Result color string.
 */ 
export function colorToString(color: Color): string {
    let {R, G, B} = color;
    if (color.brightness && color.brightness > 0) {
        R += Math.round((255 - R) * color.brightness);
        G += Math.round((255 - G) * color.brightness);
        B += Math.round((255 - B) * color.brightness);
    } else if (color.brightness && color.brightness < 0) {
        R += Math.round(R * color.brightness);
        G += Math.round(G * color.brightness);
        B += Math.round(B * color.brightness);
    }
    // Limit value to 0-255
    R = Math.min(Math.max(R, 0),255);
    G = Math.min(Math.max(G, 0),255);
    B = Math.min(Math.max(B, 0),255);

    return color.opacity != null ? `rgba(${R}, ${G}, ${B}, ${color.opacity})` : `rgb(${R}, ${G}, ${B})`;
}

