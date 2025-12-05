"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputJSXConverter = void 0;
const UE = require("ue");
const jsx_converter_1 = require("./jsx_converter");
const cssstyle_parser_1 = require("../parsers/cssstyle_parser");
const css_font_parser_1 = require("../parsers/css_font_parser");
class InputJSXConverter extends jsx_converter_1.JSXConverter {
    static DEFAULT_SLIDER_WIDTH = 240;
    isCheckbox;
    isSlider;
    isRadio;
    checkboxChangeCallback;
    textChangeCallback;
    sliderChangeCallback;
    lastSliderChangeFunc;
    lastEditTextOnChangeFunc;
    lastCheckOnChangeFunc;
    lastRadioOnChangeFunc;
    radioInternalUpdate;
    sliderWidget;
    sliderWrapper;
    constructor(typeName, props, outer) {
        super(typeName, props, outer);
        this.isCheckbox = false;
        this.isSlider = false;
        this.isRadio = false;
        this.radioInternalUpdate = false;
    }
    updateTextChangeHandle(widget, onChange) {
        // const onChangeFuncSame: boolean = compareTwoFunctions(this.lastEditTextOnChangeFunc, onChange);
        // if (onChangeFuncSame) return;
        if (this.textChangeCallback) {
            widget.OnTextChanged.Remove(this.textChangeCallback);
        }
        this.textChangeCallback = (text) => onChange({ target: { name: this.props.name, type: this.props.type, value: text } });
        widget.OnTextChanged.Add(this.textChangeCallback);
        this.lastEditTextOnChangeFunc = onChange;
    }
    setupTextChangeHandle(widget, onChange) {
        this.textChangeCallback = (text) => onChange({ target: { name: this.props.name, type: this.props.type, value: text } });
        widget.OnTextChanged.Add(this.textChangeCallback);
        this.lastEditTextOnChangeFunc = onChange;
    }
    updateCheckboxChange(widget, onChange) {
        // const onCheckChangeSame: boolean = compareTwoFunctions(this.lastCheckOnChangeFunc, onChange);
        // if (onCheckChangeSame) return;
        if (this.checkboxChangeCallback) {
            widget.OnCheckStateChanged.Remove(this.checkboxChangeCallback);
        }
        this.checkboxChangeCallback = (isChecked) => onChange({ target: { checked: isChecked } });
        widget.OnCheckStateChanged.Add(this.checkboxChangeCallback);
        this.lastCheckOnChangeFunc = onChange;
    }
    setupCheckboxChange(widget, onChange) {
        this.checkboxChangeCallback = (isChecked) => onChange({ target: { checked: isChecked } });
        widget.OnCheckStateChanged.Add(this.checkboxChangeCallback);
        this.lastCheckOnChangeFunc = onChange;
    }
    setupCheckbox(widget, props, isUpdate) {
        const { checked, onChange } = props;
        widget.SetIsChecked(checked == true);
        if (typeof onChange === 'function') {
            if (isUpdate) {
                this.updateCheckboxChange(widget, onChange);
            }
            else {
                this.setupCheckboxChange(widget, onChange);
            }
        }
        // set checkbox style
        // umg checkbox to more styles
    }
    updateRadioChange(widget, onChange) {
        // const onCheckChangeSame: boolean = compareTwoFunctions(this.lastRadioOnChangeFunc, onChange);
        // if (onCheckChangeSame) return;
        if (this.checkboxChangeCallback) {
            widget.OnCheckStateChanged.Remove(this.checkboxChangeCallback);
        }
        this.checkboxChangeCallback = (isChecked) => {
            // Prevent recursion for internal resets
            if (this.radioInternalUpdate) {
                this.radioInternalUpdate = false;
                return;
            }
            if (isChecked) {
                onChange({ target: { name: this.props.name, type: 'radio', checked: true } });
            }
            else {
                // Radio cannot be unchecked by clicking itself; re-check it
                this.radioInternalUpdate = true;
                widget.SetIsChecked(true);
            }
        };
        widget.OnCheckStateChanged.Add(this.checkboxChangeCallback);
        this.lastRadioOnChangeFunc = onChange;
    }
    setupRadioChange(widget, onChange) {
        this.checkboxChangeCallback = (isChecked) => {
            if (this.radioInternalUpdate) {
                this.radioInternalUpdate = false;
                return;
            }
            if (isChecked) {
                onChange({ target: { name: this.props.name, type: 'radio', checked: true } });
            }
            else {
                this.radioInternalUpdate = true;
                widget.SetIsChecked(true);
            }
        };
        widget.OnCheckStateChanged.Add(this.checkboxChangeCallback);
        this.lastCheckOnChangeFunc = onChange;
    }
    setupRadio(widget, props, isUpdate) {
        const { checked, onChange } = props;
        // Force standard checkbox type (visual styling can be provided via UMG styles if available)
        if (widget.WidgetStyle) {
            widget.WidgetStyle.CheckBoxType = UE.ESlateCheckBoxType.CheckBox;
        }
        if (checked === true)
            widget.SetIsChecked(true);
        else if (checked === false)
            widget.SetIsChecked(false);
        // For radios, clicking an already-checked control should not uncheck it.
        if (typeof onChange === 'function') {
            if (isUpdate) {
                this.updateRadioChange(widget, onChange);
            }
            else {
                this.setupRadioChange(widget, onChange);
            }
        }
    }
    setupEditableText(widget, props, isUpdate) {
        const { placeholder, defaultValue, disabled, readOnly, onChange } = props;
        if (placeholder)
            widget.SetHintText(placeholder);
        if (defaultValue)
            widget.SetText(defaultValue);
        if (disabled)
            widget.SetIsEnabled(false);
        if (readOnly)
            widget.SetIsReadOnly(true);
        if (typeof onChange === 'function') {
            if (isUpdate) {
                this.updateTextChangeHandle(widget, onChange);
            }
            else {
                this.setupTextChangeHandle(widget, onChange);
            }
        }
        // set editable text style for font, color, etc.
        const styles = (0, cssstyle_parser_1.getAllStyles)(this.typeName, props);
        if ((0, css_font_parser_1.hasFontStyles)(styles)) {
            if (!widget.WidgetStyle || !widget.WidgetStyle.Font) {
                const fontStyles = new UE.SlateFontInfo();
                (0, css_font_parser_1.setupFontStyles)(widget, fontStyles, styles);
                widget.SetFont(fontStyles);
            }
            else {
                (0, css_font_parser_1.setupFontStyles)(widget, widget.WidgetStyle.Font, styles);
            }
        }
    }
    updateSliderChangeHandle(widget, onChange) {
        // const onChangeFuncSame: boolean = compareTwoFunctions(this.lastSliderChangeFunc, onChange);
        // if (onChangeFuncSame) return;
        if (this.sliderChangeCallback) {
            widget.OnValueChanged.Remove(this.sliderChangeCallback);
        }
        this.sliderChangeCallback = (value) => onChange({ target: { value } });
        widget.OnValueChanged.Add(this.sliderChangeCallback);
        this.lastSliderChangeFunc = onChange;
    }
    setupSliderChangeHandle(widget, onChange) {
        this.sliderChangeCallback = (value) => onChange({ target: { value } });
        widget.OnValueChanged.Add(this.sliderChangeCallback);
        this.lastSliderChangeFunc = onChange;
    }
    setupSlider(widget, props, isUpdate) {
        const { value, min, max, step, onChange } = props;
        // Set Slider properties
        if (value !== undefined)
            widget.SetValue(value);
        if (min !== undefined)
            widget.SetMinValue(min);
        if (max !== undefined)
            widget.SetMaxValue(max);
        if (step !== undefined)
            widget.SetStepSize(step);
        // Set slider style (optional)
        if (props.sliderBarColor)
            widget.SetSliderBarColor(props.sliderBarColor);
        if (props.sliderHandleColor)
            widget.SetSliderHandleColor(props.sliderHandleColor);
        // Handle onChange event
        if (typeof onChange === 'function') {
            if (isUpdate) {
                this.updateSliderChangeHandle(widget, onChange);
            }
            else {
                this.setupSliderChangeHandle(widget, onChange);
            }
        }
        if (!isUpdate) {
            this.sliderWrapper = this.createSliderSizeBox(widget);
            return this.sliderWrapper;
        }
        return widget;
    }
    createSliderSizeBox(slider) {
        if (this.sliderWrapper) {
            return this.sliderWrapper;
        }
        const sizeBox = new UE.SizeBox(this.outer);
        sizeBox.SetWidthOverride(InputJSXConverter.DEFAULT_SLIDER_WIDTH);
        sizeBox.SetMinDesiredWidth(InputJSXConverter.DEFAULT_SLIDER_WIDTH);
        sizeBox.SetMaxDesiredWidth(InputJSXConverter.DEFAULT_SLIDER_WIDTH);
        sizeBox.AddChild(slider);
        return sizeBox;
    }
    resolveSliderInstance(widget) {
        if (this.sliderWidget) {
            return this.sliderWidget;
        }
        if (widget instanceof UE.Slider) {
            return widget;
        }
        if (widget instanceof UE.SizeBox) {
            const content = widget.GetContent();
            if (content instanceof UE.Slider) {
                return content;
            }
        }
        return null;
    }
    createNativeWidget() {
        const inputType = this.props?.type || 'text';
        let widget;
        if (inputType === 'checkbox') {
            widget = new UE.CheckBox(this.outer);
            this.setupCheckbox(widget, this.props, false);
            this.isCheckbox = true;
            this.isRadio = false;
        }
        else if (inputType === 'radio') {
            widget = new UE.CheckBox(this.outer);
            this.setupRadio(widget, this.props, false);
            this.isRadio = true;
            this.isCheckbox = false;
        }
        else if (inputType === "range") {
            const slider = new UE.Slider(this.outer);
            this.sliderWidget = slider;
            widget = this.setupSlider(slider, this.props, false);
            this.isSlider = true;
        }
        else {
            widget = new UE.EditableText(this.outer);
            if (inputType === 'password') {
                widget.SetIsPassword(true);
            }
            this.setupEditableText(widget, this.props, false);
        }
        return widget;
    }
    update(widget, oldProps, changedProps) {
        if (this.isCheckbox) {
            this.setupCheckbox(widget, changedProps, true);
        }
        else if (this.isRadio) {
            this.setupRadio(widget, changedProps, true);
        }
        else if (this.isSlider) {
            const sliderInstance = this.resolveSliderInstance(widget);
            if (sliderInstance) {
                this.sliderWidget = sliderInstance;
                this.setupSlider(sliderInstance, changedProps, true);
            }
        }
        else {
            this.setupEditableText(widget, changedProps, true);
        }
    }
}
exports.InputJSXConverter = InputJSXConverter;
//# sourceMappingURL=input.js.map