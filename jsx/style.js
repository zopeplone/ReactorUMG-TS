"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyleTagConverter = void 0;
const converter_1 = require("../converter");
const cssstyle_parser_1 = require("../parsers/cssstyle_parser");
const inline_style_registry_1 = require("../parsers/inline_style_registry");
let styleSourceCounter = 0;
class StyleTagConverter extends converter_1.ElementConverter {
    sourceId;
    cssText;
    constructor(typeName, props, outer) {
        super(typeName, props, outer);
        this.sourceId = `style-${++styleSourceCounter}`;
        this.cssText = this.extractCssText(props);
    }
    creatWidget() {
        this.registerCurrentStyles();
        return null;
    }
    createNativeWidget() {
        return null;
    }
    canUpdateWithoutNative() {
        return true;
    }
    updateWidget(_widget, _oldProps, newProps) {
        const nextCss = this.extractCssText(newProps);
        if (nextCss !== this.cssText) {
            this.cssText = nextCss;
            this.registerCurrentStyles();
        }
        this.props = newProps;
    }
    update(_widget, _oldProps, _changedProps) {
        // no-op; handled in updateWidget
    }
    appendChild(_parent, _child, _childTypeName, _childProps) {
        // Style tags do not participate in the widget tree
    }
    removeChild(_parent, _child) {
        // Style tags do not participate in the widget tree
    }
    dispose() {
        (0, inline_style_registry_1.clearInlineStylesForSource)(this.sourceId);
    }
    registerCurrentStyles() {
        const rules = (0, inline_style_registry_1.parseInlineCss)(this.cssText, cssstyle_parser_1.convertCssToStyles2);
        (0, inline_style_registry_1.registerInlineStyles)(this.sourceId, rules);
    }
    extractCssText(props) {
        if (!props) {
            return '';
        }
        if (typeof props.children === 'string') {
            return props.children;
        }
        if (Array.isArray(props.children)) {
            return props.children.filter((child) => typeof child === 'string').join('\n');
        }
        if (props.dangerouslySetInnerHTML && typeof props.dangerouslySetInnerHTML.__html === 'string') {
            return props.dangerouslySetInnerHTML.__html;
        }
        return '';
    }
}
exports.StyleTagConverter = StyleTagConverter;
//# sourceMappingURL=style.js.map