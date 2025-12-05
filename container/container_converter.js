"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerConverter = void 0;
const UE = require("ue");
const converter_1 = require("../converter");
const cssstyle_parser_1 = require("../parsers/cssstyle_parser");
const css_margin_parser_1 = require("../parsers/css_margin_parser");
const css_background_parser_1 = require("../parsers/css_background_parser");
const css_color_parser_1 = require("../parsers/css_color_parser");
const css_length_parser_1 = require("../parsers/css_length_parser");
const utils_1 = require("../misc/utils");
const alignment_parser_1 = require("../parsers/alignment_parser");
const css_font_parser_1 = require("../parsers/css_font_parser");
/**
 * 将容器参数以及布局参数转换中通用的功能实现在这个类中
 */
class ContainerConverter extends converter_1.ElementConverter {
    containerType;
    containerStyle;
    proxy;
    originalWidget;
    externalSlot; // 保存外部添加的容器slot
    sizeBoxWidget; // 保存sizebox容器
    scaleBoxWidget; // 保存scalebox容器
    borderWidget; // 保存border容器
    childConverters;
    constructor(typeName, props, outer) {
        super(typeName, props, outer);
        this.containerStyle = (0, cssstyle_parser_1.getAllStyles)(this.typeName, this.props);
        this.containerType = this.parseContainerType(this.typeName);
        this.externalSlot = null;
        this.childConverters = {
            "flex": "FlexConverter",
            "grid": "GridConverter",
            "canvas": "CanvasConverter",
            "overlay": "OverlayConverter",
            "uniformgrid": "UniformGridConverter",
        };
    }
    createProxy() {
        if (this.childConverters[this.containerType]) {
            const Module = require(`./${this.containerType}`);
            if (Module) {
                const className = this.childConverters[this.containerType];
                return new Module[className](this.typeName, this.props, this.outer);
            }
        }
        return null;
    }
    parseContainerType(type) {
        const normalizedType = (type || '').toLowerCase();
        const semanticDivs = ['form', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside'];
        if (normalizedType === 'div' || semanticDivs.includes(normalizedType)) {
            const display = this.containerStyle?.display || 'flex';
            if (display === 'grid') {
                return 'grid';
            }
            else {
                const position = this.containerStyle?.position || 'absolute';
                if (position === 'relative') {
                    return 'overlay';
                }
                else {
                    return 'flex';
                }
            }
        }
        else {
            return normalizedType;
        }
    }
    setupBackground(widget, borderWidget, updateProps) {
        let style = this.containerStyle;
        if (updateProps) {
            style = (0, cssstyle_parser_1.getAllStyles)(this.typeName, updateProps);
        }
        const background = style?.background;
        const backgroundColor = style?.backgroundColor;
        const backgroundImage = style?.backgroundImage;
        const backgroundPosition = style?.backgroundPosition;
        const usingBackground = backgroundColor || backgroundImage || backgroundPosition || background;
        if (!usingBackground) {
            return widget;
        }
        else {
            const parsedBackgroundProps = (0, css_background_parser_1.parseBackgroundProps)(style);
            let useBorder = false;
            if (!borderWidget) {
                borderWidget = new UE.Border(this.outer);
            }
            const border = borderWidget;
            if (parsedBackgroundProps?.image) {
                border.SetBrush(parsedBackgroundProps.image);
                useBorder = true;
            }
            if (parsedBackgroundProps?.color) {
                border.SetBrushColor(parsedBackgroundProps.color);
                useBorder = true;
            }
            if (parsedBackgroundProps?.alignment) {
                border.SetVerticalAlignment(parsedBackgroundProps.alignment?.vertical);
                border.SetHorizontalAlignment(parsedBackgroundProps.alignment?.horizontal);
                border.SetPadding(parsedBackgroundProps.alignment?.padding);
            }
            const scale = style?.scale;
            border.SetDesiredSizeScale((0, css_length_parser_1.parseScale)(scale));
            // color
            const contentColor = style?.color;
            if (contentColor) {
                const color = (0, css_color_parser_1.parseToLinearColor)(contentColor);
                border.SetContentColorAndOpacity(new UE.LinearColor(color.r, color.g, color.b, color.a));
            }
            if (useBorder && !updateProps) {
                this.externalSlot = border.AddChild(widget);
            }
            else {
                return widget;
            }
            return border;
        }
    }
    setupBoxSize(Widget, sizeBoxWidget, updateProps) {
        let style = this.containerStyle;
        if (updateProps) {
            style = (0, cssstyle_parser_1.getAllStyles)(this.typeName, updateProps);
        }
        const width = style?.width || 'auto';
        const height = style?.height || 'auto';
        if (width === 'auto' && height === 'auto') {
            return Widget;
        }
        else {
            if (!sizeBoxWidget) {
                sizeBoxWidget = new UE.SizeBox(this.outer);
            }
            const sizeBox = sizeBoxWidget;
            if (width !== 'auto') {
                const widthPx = (0, css_length_parser_1.convertLengthUnitToSlateUnit)(width, this.containerStyle, undefined);
                if (widthPx !== 0)
                    sizeBox.SetWidthOverride(widthPx);
            }
            if (height !== 'auto') {
                const heightPx = (0, css_length_parser_1.convertLengthUnitToSlateUnit)(height, this.containerStyle, undefined);
                if (heightPx !== 0)
                    sizeBox.SetHeightOverride(heightPx);
            }
            const maxWidth = this.containerStyle?.maxWidth;
            if (maxWidth) {
                sizeBox.SetMaxDesiredWidth((0, css_length_parser_1.convertLengthUnitToSlateUnit)(maxWidth, this.containerStyle));
            }
            const maxHeight = this.containerStyle?.maxHeight;
            if (maxHeight) {
                sizeBox.SetMaxDesiredHeight((0, css_length_parser_1.convertLengthUnitToSlateUnit)(maxHeight, this.containerStyle));
            }
            const minWidth = this.containerStyle?.minWidth;
            if (minWidth) {
                sizeBox.SetMinDesiredWidth((0, css_length_parser_1.convertLengthUnitToSlateUnit)(minWidth, this.containerStyle));
            }
            const minHeight = this.containerStyle?.minHeight;
            if (minHeight) {
                sizeBox.SetMinDesiredHeight((0, css_length_parser_1.convertLengthUnitToSlateUnit)(minHeight, this.containerStyle));
            }
            const aspectRatio = this.containerStyle?.aspectRatio;
            if (aspectRatio) {
                sizeBox.SetMaxAspectRatio((0, css_length_parser_1.parseAspectRatio)(aspectRatio));
                sizeBox.SetMinAspectRatio((0, css_length_parser_1.parseAspectRatio)(aspectRatio));
            }
            if (!updateProps) {
                this.externalSlot = sizeBox.AddChild(Widget);
            }
            return sizeBox;
        }
    }
    setupBoxScale(widget, scaleBoxWidget, updateProps) {
        let style = this.containerStyle;
        if (updateProps) {
            style = (0, cssstyle_parser_1.getAllStyles)(this.typeName, updateProps);
        }
        const objectFit = style?.objectFit;
        if (objectFit) {
            if (!scaleBoxWidget) {
                scaleBoxWidget = new UE.ScaleBox(this.outer);
            }
            const scaleBox = scaleBoxWidget;
            if (objectFit === 'contain') {
                scaleBox.SetStretch(UE.EStretch.ScaleToFit);
            }
            else if (objectFit === 'cover') {
                scaleBox.SetStretch(UE.EStretch.ScaleToFill);
            }
            else if (objectFit === 'fill') {
                scaleBox.SetStretch(UE.EStretch.Fill);
            }
            else if (objectFit === 'none') {
                scaleBox.SetStretch(UE.EStretch.None);
            }
            else if (objectFit === 'scale-down') {
                scaleBox.SetStretch(UE.EStretch.UserSpecifiedWithClipping);
                const scale = style?.scale;
                if (scale) {
                    scaleBox.SetUserSpecifiedScale((0, utils_1.safeParseFloat)(scale));
                }
            }
            this.externalSlot = scaleBox.AddChild(widget);
            return scaleBox;
        }
        else {
            return widget;
        }
    }
    initClipChildWidget(parentWidget) {
        const style = this.containerStyle;
        const visibility = style?.visibility;
        if (visibility === 'clip') {
            parentWidget.SetClipping(UE.EWidgetClipping.ClipToBounds);
        }
    }
    initChildAlignmentForExternalSlot(childProps) {
        if (childProps && this.externalSlot) {
            const Style = (0, cssstyle_parser_1.getAllStyles)(this.typeName, childProps);
            const childAlignment = (0, alignment_parser_1.parseWidgetSelfAlignment)(Style);
            if (this.externalSlot instanceof UE.SizeBoxSlot) {
                this.externalSlot.SetHorizontalAlignment(childAlignment.horizontal);
                this.externalSlot.SetVerticalAlignment(childAlignment.vertical);
                this.externalSlot.SetPadding(childAlignment.padding);
            }
            else if (this.externalSlot instanceof UE.ScaleBoxSlot) {
                this.externalSlot.SetHorizontalAlignment(childAlignment.horizontal);
                this.externalSlot.SetVerticalAlignment(childAlignment.vertical);
                this.externalSlot.SetPadding(childAlignment.padding);
            }
            else if (this.externalSlot instanceof UE.BorderSlot) {
                this.externalSlot.SetHorizontalAlignment(childAlignment.horizontal);
                this.externalSlot.SetVerticalAlignment(childAlignment.vertical);
                this.externalSlot.SetPadding(childAlignment.padding);
            }
            else if (this.externalSlot instanceof UE.WrapBoxSlot) {
                this.externalSlot.SetHorizontalAlignment(childAlignment.horizontal);
                this.externalSlot.SetVerticalAlignment(childAlignment.vertical);
                this.externalSlot.SetPadding(childAlignment.padding);
            }
        }
    }
    initChildPadding(panelSlot, childStyle) {
        if (!panelSlot || typeof panelSlot.SetPadding !== 'function') {
            return;
        }
        const margin = (0, css_margin_parser_1.convertMargin)(childStyle);
        if (margin) {
            panelSlot.SetPadding(margin);
        }
        const padding = (0, css_margin_parser_1.convertPadding)(childStyle);
        if (padding) {
            panelSlot.SetPadding(padding);
        }
    }
    createNativeWidget() {
        let widget = null;
        if (!this.proxy) {
            this.proxy = this.createProxy();
        }
        if (this.proxy) {
            widget = this.proxy.createNativeWidget();
            this.originalWidget = widget;
            if (widget) {
                widget = this.setupBackground(widget);
                this.borderWidget = widget instanceof UE.Border ? widget : null;
            }
            if (widget) {
                widget = this.setupBoxSize(widget);
                this.sizeBoxWidget = widget instanceof UE.SizeBox ? widget : null;
            }
            if (widget) {
                widget = this.setupBoxScale(widget);
                this.scaleBoxWidget = widget instanceof UE.ScaleBox ? widget : null;
            }
        }
        return widget;
    }
    update(widget, oldProps, changedProps) {
        if (this.proxy) {
            this.proxy.update(widget, oldProps, changedProps);
            // update props
            if (this.borderWidget) {
                this.setupBackground(widget, this.borderWidget, changedProps);
            }
            if (this.sizeBoxWidget) {
                this.setupBoxSize(widget, this.sizeBoxWidget, changedProps);
            }
            if (this.scaleBoxWidget) {
                this.setupBoxScale(widget, this.scaleBoxWidget, changedProps);
            }
        }
    }
    appendChild(parent, child, childTypeName, childProps) {
        if (this.proxy) {
            this.initClipChildWidget(parent);
            this.initChildAlignmentForExternalSlot(childProps);
            this.proxy.appendChild(this.originalWidget, child, childTypeName, childProps);
        }
        if (childProps["_children_text_instance"]) {
            // Mirror TextConverter.setupTextBlockProperties for inline text instances
            if (child instanceof UE.TextBlock) {
                const styles = this.containerStyle ?? {};
                // Font family/size/weight/outline/spacing
                if ((0, css_font_parser_1.hasFontStyles)(styles)) {
                    if (!child.Font) {
                        const fontStyles = new UE.SlateFontInfo();
                        (0, css_font_parser_1.setupFontStyles)(child, fontStyles, styles);
                        child.SetFont(fontStyles);
                    }
                    else {
                        (0, css_font_parser_1.setupFontStyles)(child, child.Font, styles);
                    }
                }
                // Color
                const fontColor = styles?.color ?? styles?.fontColor;
                if (fontColor) {
                    const rgba = (0, css_color_parser_1.parseToLinearColor)(fontColor);
                    const specifiedColor = child.ColorAndOpacity?.SpecifiedColor;
                    if (specifiedColor) {
                        specifiedColor.R = rgba.r;
                        specifiedColor.G = rgba.g;
                        specifiedColor.B = rgba.b;
                        specifiedColor.A = rgba.a;
                    }
                }
                // Text alignment
                const textAlign = styles?.textAlign;
                if (textAlign) {
                    const v = String(textAlign).toLowerCase();
                    if (v === 'center') {
                        child.Justification = UE.ETextJustify.Center;
                    }
                    else if (v === 'right') {
                        child.Justification = UE.ETextJustify.Right;
                    }
                    else {
                        child.Justification = UE.ETextJustify.Left;
                    }
                }
                // Text transform
                const textTransform = styles?.textTransform;
                if (textTransform) {
                    const v = String(textTransform).toLowerCase();
                    if (v === 'uppercase') {
                        child.TextTransformPolicy = UE.ETextTransformPolicy.ToUpper;
                    }
                    else if (v === 'lowercase') {
                        child.TextTransformPolicy = UE.ETextTransformPolicy.ToLower;
                    }
                    else {
                        child.TextTransformPolicy = UE.ETextTransformPolicy.None;
                    }
                }
                // Line height
                const lineHeight = styles?.lineHeight;
                if (lineHeight !== undefined && lineHeight !== null) {
                    let resolved = null;
                    if (typeof lineHeight === 'number') {
                        resolved = lineHeight;
                    }
                    else if (typeof lineHeight === 'string' && lineHeight.trim().length > 0) {
                        resolved = (0, css_length_parser_1.convertLengthUnitToSlateUnit)(lineHeight, styles);
                    }
                    if (resolved !== null && resolved !== undefined) {
                        child.LineHeightPercentage = resolved;
                    }
                }
                UE.UMGManager.SynchronizeWidgetProperties(child);
            }
        }
    }
    removeChild(parent, child) {
        child.RemoveFromParent();
    }
}
exports.ContainerConverter = ContainerConverter;
//# sourceMappingURL=container_converter.js.map