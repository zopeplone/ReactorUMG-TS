"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeWidgetConverter = void 0;
const umg_converter_1 = require("./umg_converter");
const UE = require("ue");
const puerts = require("puerts");
class NativeWidgetConverter extends umg_converter_1.UMGConverter {
    callbackRecords;
    constructor(typeName, props, outer) {
        super(typeName, props, outer);
        this.callbackRecords = {};
    }
    getNativeWidget() {
        const classPath = exports.lazyloadComponents[this.typeName];
        let widget;
        if (classPath) {
            widget = UE.NewObject(UE.Class.Load(classPath), this.outer);
        }
        else {
            widget = new UE[this.typeName](this.outer);
        }
        return widget;
    }
    bindEvents(widget, eventName, callback) {
        let widgetEvent = widget[eventName];
        if (typeof widgetEvent.Add === 'function') {
            widgetEvent.Add(callback);
            this.callbackRecords[eventName] = () => {
                widgetEvent.Remove(callback);
            };
        }
        else if (typeof widgetEvent.Bind === 'function') {
            widgetEvent.Bind(callback);
            this.callbackRecords[eventName] = () => {
                widgetEvent.Unbind();
            };
        }
        else {
            console.error(`Failed to bind event, ${eventName} not supported`);
        }
    }
    unbindEvents(eventName) {
        let remover = this.callbackRecords[eventName];
        this.callbackRecords[eventName] = undefined;
        if (remover) {
            remover();
        }
    }
    createNativeWidget() {
        const widget = this.getNativeWidget();
        if (!widget) {
            return null;
        }
        let mergeProps = {};
        for (const key in this.props) {
            let val = this.props[key];
            if (typeof val === 'function') {
                this.bindEvents(widget, key, val);
            }
            else if (key !== 'children') {
                mergeProps[key] = val;
            }
        }
        puerts.merge(widget, mergeProps);
        return widget;
    }
    update(widget, oldProps, changedProps) {
        let propsChanged = {};
        for (const key in changedProps) {
            let val = changedProps[key];
            if (key !== 'children') {
                if (typeof val === 'function') {
                    this.unbindEvents(key);
                    this.bindEvents(widget, key, val);
                }
                else {
                    propsChanged[key] = val;
                }
            }
        }
        if (propsChanged) {
            puerts.merge(widget, propsChanged);
            UE.UMGManager.SynchronizeWidgetProperties(widget);
        }
    }
    appendChild(parent, child, childTypeName, childProps) {
        if (parent instanceof UE.PanelWidget) {
            parent.AddChild(child);
        }
    }
    removeChild(parent, child) {
        if (parent instanceof UE.PanelWidget) {
            parent.RemoveChild(child);
        }
    }
}
exports.NativeWidgetConverter = NativeWidgetConverter;
//# sourceMappingURL=native_widget_converter.js.map