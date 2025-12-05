"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidationBoxConverter = void 0;
const UE = require("ue");
const umg_converter_1 = require("../umg_converter");
class InvalidationBoxConverter extends umg_converter_1.UMGConverter {
    constructor(typeName, props, outer) {
        super(typeName, props, outer);
    }
    createNativeWidget() {
        const invalidationBox = new UE.InvalidationBox(this.outer);
        const cache = this.props?.cache;
        if (cache) {
            invalidationBox.SetCanCache(cache);
        }
        return invalidationBox;
    }
    update(widget, oldProps, changedProps) {
        const invalidationBox = widget;
        const cache = changedProps?.cache;
        if (cache) {
            invalidationBox.SetCanCache(cache);
        }
    }
}
exports.InvalidationBoxConverter = InvalidationBoxConverter;
//# sourceMappingURL=InvalidationBox.js.map