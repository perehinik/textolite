const windowsFonts = [
    'Arial', 
    'Arial Black', 
    'Bahnschrift', 
    'Calibri', 
    'Cambria', 
    'Cambria Math', 
    'Candara', 
    'Comic Sans MS', 
    'Consolas', 
    'Constantia', 
    'Corbel', 
    'Courier New', 
    'Ebrima', 
    'Franklin Gothic Medium', 
    'Gabriola', 
    'Gadugi', 
    'Georgia', 
    'HoloLens MDL2 Assets', 
    'Impact', 
    'Ink Free', 
    'Javanese Text', 
    'Leelawadee UI', 
    'Lucida Console', 
    'Lucida Sans Unicode', 
    'Malgun Gothic', 
    'Marlett', 
    'Microsoft Himalaya', 
    'Microsoft JhengHei', 
    'Microsoft New Tai Lue', 
    'Microsoft PhagsPa', 
    'Microsoft Sans Serif', 
    'Microsoft Tai Le', 
    'Microsoft YaHei', 
    'Microsoft Yi Baiti', 
    'MingLiU-ExtB', 
    'Mongolian Baiti', 
    'MS Gothic', 
    'MV Boli', 
    'Myanmar Text', 
    'Nirmala UI', 
    'Palatino Linotype', 
    'Segoe MDL2 Assets', 
    'Segoe Print', 
    'Segoe Script', 
    'Segoe UI', 
    'Segoe UI Historic', 
    'Segoe UI Emoji', 
    'Segoe UI Symbol', 
    'SimSun', 'Sitka', 
    'Sylfaen', 
    'Symbol', 
    'Tahoma', 
    'Times New Roman', 
    'Trebuchet MS', 
    'Verdana', 
    'Webdings', 
    'Wingdings', 
    'Yu Gothic'
];

const macFonts = [
    'American Typewriter', 
    'Andale Mono', 
    'Arial', 
    'Arial Black', 
    'Arial Narrow', 
    'Arial Rounded MT Bold', 
    'Arial Unicode MS', 
    'Avenir', 
    'Avenir Next', 
    'Avenir Next Condensed', 
    'Baskerville', 
    'Big Caslon', 
    'Bodoni 72', 
    'Bodoni 72 Oldstyle', 
    'Bodoni 72 Smallcaps', 
    'Bradley Hand', 
    'Brush Script MT', 
    'Chalkboard', 
    'Chalkboard SE', 
    'Chalkduster', 
    'Charter', 
    'Cochin', 
    'Comic Sans MS', 
    'Copperplate', 
    'Courier', 
    'Courier New', 
    'Didot', 
    'DIN Alternate', 
    'DIN Condensed', 
    'Futura', 
    'Geneva', 
    'Georgia', 
    'Gill Sans', 
    'Helvetica', 
    'Helvetica Neue', 
    'Herculanum', 
    'Hoefler Text', 
    'Impact', 
    'Lucida Grande', 
    'Luminari', 
    'Marker Felt', 
    'Menlo', 
    'Microsoft Sans Serif', 
    'Monaco', 
    'Noteworthy', 
    'Optima', 
    'Palatino', 
    'Papyrus', 
    'Phosphate', 
    'Rockwell', 
    'Savoye LET', 
    'SignPainter', 
    'Skia', 
    'Snell Roundhand', 
    'Tahoma', 
    'Times', 
    'Times New Roman', 
    'Trattatello', 
    'Trebuchet MS', 
    'Verdana', 
    'Zapfino'
]; 

const linuxFonts = [
    'Abyssinica SIL', 
    'AnjaliOldLipi', 
    'Bitstream Charter', 
    'C059', 
    'Century Schoolbook', 
    'Century Schoolbook L', 
    'Chilanka', 
    'Courier 10 Pitch', 
    'D050000L', 
    'DejaVu Sans', 
    'DejaVu Sans Mono', 
    'DejaVu Serif', 
    'Dyuthi', 
    'FreeMono', 
    'FreeSans', 
    'FreeSerif', 
    'Garuda', 
    'Gayathri', 
    'Gayathri,Gayathri Thin', 
    'Karumbi', 
    'Keraleeyam', 
    'Khmer OS', 
    'Khmer OS System', 
    'Kinnari', 
    'Laksaman', 
    'Liberation', 
    'Liberation Mono', 
    'Liberation Sans', 
    'Liberation Sans Narrow', 
    'Liberation Serif', 
    'Lohit Devanagari', 
    'Lohit Telugu', 
    'Loma', 
    'Manjari', 
    'Manjari Thin', 
    'Meera', 
    'Nakula', 
    'Nimbus Mono', 
    'Nimbus Mono L', 
    'Nimbus Mono PS', 
    'Nimbus Roman', 
    'Nimbus Roman No9 L', 
    'Nimbus Sans', 
    'Nimbus Sans L', 
    'Nimbus Sans Narrow', 
    'Norasi', 
    'Noto Mono', 
    'Noto Sans', 
    'Noto Sans CJK HK', 
    'Noto Sans CJK JP', 
    'Noto Sans CJK KR', 
    'Noto Sans CJK SC', 
    'Noto Sans CJK TC', 
    'Noto Sans Mono', 
    'Noto Sans Mono CJK HK', 
    'Noto Sans Mono CJK JP', 
    'Noto Sans Mono CJK KR', 
    'Noto Sans Mono CJK SC', 
    'Noto Serif', 
    'Noto Serif CJK HK', 
    'Noto Serif CJK JP', 
    'Noto Serif CJK KR', 
    'Noto Serif CJK SC', 
    'Noto Serif CJK TC', 
    'P052', 
    'Padauk', 
    'Padauk Book', 
    'Phetsarath OT', 
    'Purisa', 
    'Rachana', 
    'Rasa', 
    'Rasa Medium', 
    'Rasa SemiBold', 
    'Rasa,Rasa Light', 
    'Rasa,Rasa Medium', 
    'Rasa,Rasa SemiBold', 
    'Sahadeva', 
    'Sawasdee', 
    'Standard Symbols PS', 
    'Tibetan Machine Uni', 
    'Tlwg Mono', 
    'Tlwg Typewriter', 
    'Tlwg Typist', 
    'Tlwg Typo', 
    'URW Bookman', 
    'URW Bookman L', 
    'URW Chancery', 
    'URW Chancery L', 
    'URW Gothic', 
    'URW Gothic L', 
    'URW Palladio', 
    'URW Palladio L', 
    'Ubuntu', 
    'Ubuntu Condensed', 
    'Ubuntu Light', 
    'Ubuntu Mono', 
    'Ubuntu Thin', 
    'Ubuntu,Ubuntu Light', 
    'Ubuntu,Ubuntu Thin', 
    'Umpush', 
    'Uroob', 
    'Waree', 
    'Yrsa', 
    'Yrsa Medium', 
    'Yrsa SemiBold', 
    'Yrsa,Yrsa Light', 
    'Yrsa,Yrsa Medium', 
    'Yrsa,Yrsa SemiBold', 
    'Z003', 
    'padmaa,padmmaa', 
    'padmmaa'
];

const fontCheck = new Set(windowsFonts.concat(macFonts).concat(linuxFonts).sort());

/**
 * Verifies which fonts are available.
 * 
 * @returns - Array with available font names.
 */
export function getAvailableFonts(): string[] {
    const fontAvailable: string[] = [];
    for (const font of fontCheck.values()) {
        if (document.fonts.check(`12px "${font}"`)) {
            const div = document.createElement("div");
            div.style.fontFamily = font;
            const actualFont = div.style.fontFamily;
            const actualFontFormat = actualFont.replaceAll('"', '')
            if (!fontAvailable.includes(actualFont) && !fontAvailable.includes(actualFontFormat)) {
                fontAvailable.push(actualFont);
            }
        }
    }
    return fontAvailable;
}
