"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonConverter = void 0;
/**
 * UMG Button
 */
const UE = require("ue");
const umg_converter_1 = require("../umg_converter");
const brush_parser_1 = require("../../parsers/brush_parser");
const css_color_parser_1 = require("../../parsers/css_color_parser");
const css_margin_parser_1 = require("../../parsers/css_margin_parser");
class ButtonConverter extends umg_converter_1.UMGConverter {
    constructor(typeName, props, outer) {
        super(typeName, props, outer);
    }
    setupButtonProps(button, props) {
        const brushKeyMap = {
            'background': 'Normal',
            'hoveredBackground': 'Hovered',
            'pressedBackground': 'Pressed',
            'disabledBackground': 'Disabled'
        };
        const colorKeyMap = {
            'textColor': 'ColorAndOpacity',
            'backgroundColor': 'BackgroundColor'
        };
        const paddingKeyMap = {
            'normalPadding': 'NormalPadding',
            'pressedPadding': 'PressedPadding',
        };
        const soundKeyMap = {
            'pressedSound': 'PressedSlateSound',
            'hoveredSound': 'HoveredSlateSound',
        };
        const eventKeyMap = {
            'onClick': 'OnClicked',
            'onPressed': 'OnPressed',
            'onReleased': 'OnReleased',
            'onHovered': 'OnHovered',
            'onUnhovered': 'OnUnhovered',
        };
        for (const key in props) {
            const value = props[key];
            if (brushKeyMap[key]) {
                button.WidgetStyle[brushKeyMap[key]] = (0, brush_parser_1.parseBrush)(value);
            }
            else if (colorKeyMap[key]) {
                const rgba = (0, css_color_parser_1.parseToLinearColor)(value);
                button[colorKeyMap[key]].R = rgba.r;
                button[colorKeyMap[key]].G = rgba.g;
                button[colorKeyMap[key]].B = rgba.b;
                button[colorKeyMap[key]].A = rgba.a;
            }
            else if (paddingKeyMap[key]) {
                button[paddingKeyMap[key]] = (0, css_margin_parser_1.convertToUEMargin)({}, value, '', '', '', '');
            }
            else if (soundKeyMap[key]) {
                // todo@Caleb196x: 添加sound
            }
            else if (eventKeyMap[key]) {
                button[eventKeyMap[key]].Add(value);
            }
            else if (key === 'focusable') {
                button.IsFocusable = value;
            }
        }
    }
    createNativeWidget() {
        const button = new UE.Button(this.outer);
        this.setupButtonProps(button, this.props);
        return button;
    }
    update(widget, oldProps, changedProps) {
        this.setupButtonProps(widget, changedProps);
    }
}
exports.ButtonConverter = ButtonConverter;
//# sourceMappingURL=Button.js.map