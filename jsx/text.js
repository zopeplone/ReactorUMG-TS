"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextConverter = void 0;
const css_color_parser_1 = require("../parsers/css_color_parser");
const css_font_parser_1 = require("../parsers/css_font_parser");
const css_length_parser_1 = require("../parsers/css_length_parser");
const css_margin_parser_1 = require("../parsers/css_margin_parser");
const cssstyle_parser_1 = require("../parsers/cssstyle_parser");
const jsx_converter_1 = require("./jsx_converter");
const utils_1 = require("../misc/utils");
const UE = require("ue");
class TextConverter extends jsx_converter_1.JSXConverter {
    textFontSetupHandlers = {};
    textWrapBoxSlots;
    static elementDefaultStyles = {
        'text': {
            lineHeight: '1.4',
            color: 'white'
        },
        'span': {
            lineHeight: '1.4',
            color: 'white'
        },
        'label': {
            fontWeight: '600',
            lineHeight: '1.4',
            color: 'white'
        },
        'p': {
            lineHeight: '1.6',
            marginBottom: '12px',
            color: 'white'
        },
        'a': {
            color: '#1e90ff',
            textDecoration: 'underline',
            lineHeight: '1.4'
        },
        'h1': {
            fontSize: '32px',
            fontWeight: '700',
            lineHeight: '1.25',
            color: 'white'
        },
        'h2': {
            fontSize: '28px',
            fontWeight: '700',
            lineHeight: '1.3',
            color: 'white'
        },
        'h3': {
            fontSize: '24px',
            fontWeight: '600',
            lineHeight: '1.35',
            color: 'white'
        },
        'h4': {
            fontSize: '20px',
            fontWeight: '600',
            lineHeight: '1.4',
            color: 'white'
        },
        'h5': {
            fontSize: '18px',
            fontWeight: '600',
            lineHeight: '1.45',
            color: 'white'
        },
        'h6': {
            fontSize: '16px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            lineHeight: '1.45',
            color: 'white'
        },
        'pre': {
            whiteSpace: 'pre',
            fontFamily: 'monospace',
            lineHeight: '1.4',
            color: 'white'
        }
    };
    loweredTypeName;
    constructor(typeName, props, outer) {
        super(typeName, props, outer);
        this.loweredTypeName = (typeName ?? '').toLowerCase();
        this.textFontSetupHandlers = {
            color: (textBlock, prop) => this.setupFontColor(textBlock, prop),
            fontColor: (textBlock, prop) => this.setupFontColor(textBlock, prop),
            textAlign: (textBlock, prop) => this.setupTextAlignment(textBlock, prop),
            textTransform: (textBlock, prop) => this.setupTextTransform(textBlock, prop),
            lineHeight: (textBlock, prop) => this.setupLineHeight(textBlock, prop),
        };
        this.textWrapBoxSlots = new Map();
    }
    normalizeStyles(props) {
        const styles = (0, cssstyle_parser_1.getAllStyles)(this.typeName, props) ?? {};
        const defaults = TextConverter.elementDefaultStyles[this.loweredTypeName] ?? {};
        const resolved = { ...defaults, ...styles };
        if (props) {
            const directKeys = ['color', 'fontColor', 'textAlign', 'textTransform', 'lineHeight'];
            for (const key of directKeys) {
                if (props[key] !== undefined) {
                    resolved[key] = props[key];
                }
            }
        }
        return resolved;
    }
    setupFontColor(textBlock, prop) {
        const fontColor = prop?.color ?? prop?.fontColor;
        if (!fontColor) {
            return;
        }
        const rgba = (0, css_color_parser_1.parseToLinearColor)(fontColor);
        const specifiedColor = textBlock.ColorAndOpacity?.SpecifiedColor;
        if (!specifiedColor) {
            return;
        }
        specifiedColor.R = rgba.r;
        specifiedColor.G = rgba.g;
        specifiedColor.B = rgba.b;
        specifiedColor.A = rgba.a;
    }
    setupTextAlignment(textBlock, prop) {
        const textAlignment = prop?.textAlign;
        if (!textAlignment) {
            return;
        }
        switch (textAlignment) {
            case 'center':
                textBlock.Justification = UE.ETextJustify.Center;
                break;
            case 'right':
                textBlock.Justification = UE.ETextJustify.Right;
                break;
            default:
                textBlock.Justification = UE.ETextJustify.Left;
        }
    }
    setupTextTransform(textBlock, prop) {
        const textTransform = prop?.textTransform;
        if (!textTransform) {
            return;
        }
        switch (textTransform) {
            case 'uppercase':
                textBlock.TextTransformPolicy = UE.ETextTransformPolicy.ToUpper;
                break;
            case 'lowercase':
                textBlock.TextTransformPolicy = UE.ETextTransformPolicy.ToLower;
                break;
            default:
                textBlock.TextTransformPolicy = UE.ETextTransformPolicy.None;
        }
    }
    normalizeLineHeight(lineHeight, styleContext) {
        if (lineHeight === null || lineHeight === undefined) {
            return null;
        }
        if (typeof lineHeight === 'number') {
            return lineHeight;
        }
        if (typeof lineHeight === 'string' && lineHeight.trim().length > 0) {
            return (0, css_length_parser_1.convertLengthUnitToSlateUnit)(lineHeight, styleContext);
        }
        return null;
    }
    setupLineHeight(textBlock, prop) {
        const lineHeight = prop?.lineHeight;
        const resolved = this.normalizeLineHeight(lineHeight, prop);
        if (resolved !== null) {
            textBlock.LineHeightPercentage = resolved;
        }
    }
    setupWrapBoxProperties(wrapBox, props) {
        const styles = (0, cssstyle_parser_1.getAllStyles)(this.typeName, props) ?? {};
        let isVertical = false;
        // Orientation: default horizontal; allow overriding via props.orientation or styles.flexDirection
        const orientationRaw = (props?.orientation || styles?.orientation || styles?.flexDirection || '').toString().toLowerCase();
        if (orientationRaw.includes('vertical') || orientationRaw.includes('column')) {
            wrapBox.Orientation = UE.EOrientation.Orient_Vertical;
            isVertical = true;
        }
        else {
            wrapBox.Orientation = UE.EOrientation.Orient_Horizontal;
            isVertical = false;
        }
        // Alignment: map textAlign to wrap box horizontal alignment
        const textAlign = styles?.textAlign || props?.textAlign;
        if (textAlign) {
            const v = String(textAlign).toLowerCase();
            if (v === 'center') {
                wrapBox.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Center);
            }
            else if (v === 'right') {
                wrapBox.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right);
            }
            else if (v === 'left') {
                wrapBox.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left);
            }
        }
        // Padding between items: prefer CSS gap/rowGap/columnGap
        let gapX = 0;
        let gapY = 0;
        if (styles?.gap) {
            const v = (0, css_margin_parser_1.convertGap)(styles.gap, styles);
            gapX = v?.X ?? 0; // column gap
            gapY = v?.Y ?? 0; // row gap
        }
        if (styles?.padding) {
            const p = (0, css_margin_parser_1.convertPadding)(styles);
            if (isVertical) {
                gapX = p?.Top ?? 0; // column gap
                gapY = p?.Bottom ?? 0;
            }
            else {
                gapX = p?.Left ?? 0; // column gap
                gapY = p?.Right ?? 0;
            }
        }
        if (styles?.columnGap !== undefined) {
            gapX = (0, css_length_parser_1.convertLengthUnitToSlateUnit)(styles.columnGap, styles) || gapX;
        }
        if (styles?.rowGap !== undefined) {
            gapY = (0, css_length_parser_1.convertLengthUnitToSlateUnit)(styles.rowGap, styles) || gapY;
        }
        // Apply inner slot padding based on orientation
        if (wrapBox.Orientation === UE.EOrientation.Orient_Horizontal) {
            wrapBox.SetInnerSlotPadding(new UE.Vector2D(gapX, gapY));
        }
        else {
            wrapBox.SetInnerSlotPadding(new UE.Vector2D(gapY, gapX));
        }
    }
    isValidTextBlock(textBlock) {
        if (!textBlock) {
            return false;
        }
        const candidate = textBlock;
        if (typeof candidate.IsPendingKill === 'function' && candidate.IsPendingKill()) {
            return false;
        }
        if (typeof candidate.IsValidLowLevelFast === 'function') {
            return candidate.IsValidLowLevelFast();
        }
        if (typeof candidate.IsValidLowLevel === 'function') {
            return candidate.IsValidLowLevel();
        }
        return true;
    }
    setupTextBlockProperties(textBlock, props) {
        if (!this.isValidTextBlock(textBlock)) {
            return;
        }
        const styles = this.normalizeStyles(props);
        const whiteSpace = (styles?.whiteSpace ?? '').toString().toLowerCase();
        const shouldAutoWrap = this.loweredTypeName !== 'pre' && whiteSpace !== 'pre' && whiteSpace !== 'nowrap';
        textBlock.AutoWrapText = shouldAutoWrap;
        if ((0, css_font_parser_1.hasFontStyles)(styles)) {
            if (!textBlock.Font) {
                const fontStyles = new UE.SlateFontInfo();
                (0, css_font_parser_1.setupFontStyles)(textBlock, fontStyles, styles);
                textBlock.SetFont(fontStyles);
            }
            else {
                (0, css_font_parser_1.setupFontStyles)(textBlock, textBlock.Font, styles);
            }
        }
        for (const key in this.textFontSetupHandlers) {
            if (Object.prototype.hasOwnProperty.call(styles, key)) {
                this.textFontSetupHandlers[key](textBlock, styles);
            }
        }
    }
    normalizeContent(value) {
        if (value === undefined) {
            return undefined;
        }
        if (value === null) {
            return '';
        }
        if (Array.isArray(value)) {
            return value.map((item) => this.normalizeContent(item) ?? '').join('');
        }
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
        }
        return String(value);
    }
    extractTextContent(props) {
        if (!props) {
            return '';
        }
        if (Object.prototype.hasOwnProperty.call(props, 'children')) {
            const normalized = this.normalizeContent(props.children);
            if (normalized !== undefined) {
                return normalized;
            }
        }
        if (Object.prototype.hasOwnProperty.call(props, 'text')) {
            const normalized = this.normalizeContent(props.text);
            if (normalized !== undefined) {
                return normalized;
            }
        }
        return '';
    }
    applyTextContent(textBlock, content) {
        if (!this.isValidTextBlock(textBlock)) {
            return;
        }
        textBlock.SetText(content ?? '');
    }
    createNativeWidget() {
        if (this.props?.children) {
            if (this.typeName === "label" && (0, utils_1.isReactElementInChildren)(this.props.children)) {
                // create wrap box
                const wrapBox = new UE.WrapBox(this.outer);
                this.setupWrapBoxProperties(wrapBox, this.props);
                return wrapBox;
            }
        }
        const text = new UE.TextBlock(this.outer);
        this.setupTextBlockProperties(text, this.props);
        const content = this.extractTextContent(this.props);
        this.applyTextContent(text, content);
        UE.UMGManager.SynchronizeWidgetProperties(text);
        return text;
    }
    update(widget, _oldProps, _changedProps) {
        if (widget instanceof UE.WrapBox) {
            if (this.props?.children || _changedProps?.children) {
                if (((0, utils_1.isReactElementInChildren)(this.props.children)
                    || (0, utils_1.isReactElementInChildren)(_changedProps.children))) {
                    this.setupWrapBoxProperties(widget, _changedProps);
                }
            }
        }
        else if (widget instanceof UE.TextBlock) {
            const text = widget;
            this.setupTextBlockProperties(text, _changedProps);
            const content = this.extractTextContent(_changedProps);
            this.applyTextContent(text, content);
            // UE.UMGManager.SynchronizeWidgetProperties(text);
        }
    }
    appendChild(parent, child, childTypeName, childProps) {
        if (parent instanceof UE.WrapBox) {
            const slot = parent.AddChildToWrapBox(child);
            // slot.bFillEmptySpace = true;
            this.textWrapBoxSlots.set(child, slot);
        }
    }
    removeChild(parent, child) {
        if (parent instanceof UE.WrapBox) {
            this.textWrapBoxSlots.delete(child);
            parent.RemoveChild(child);
        }
    }
}
exports.TextConverter = TextConverter;
//# sourceMappingURL=text.js.map