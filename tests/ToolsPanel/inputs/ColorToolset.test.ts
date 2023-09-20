import { 
    colorToString,
    Color
} from "../../../src/ToolsPanel/Inputs/ColorToolset";

describe('Testing color to string', () => {
    test('test1', () => {
        const color: Color = {R:255, G:0, B:0}
        expect(colorToString(color)).toEqual("rgb(255, 0, 0)");
    });

    test('test2', () => {
        const color: Color = {R:255, G:0, B:0, opacity:0.4}
        expect(colorToString(color)).toEqual("rgba(255, 0, 0, 0.4)");
    });
});
