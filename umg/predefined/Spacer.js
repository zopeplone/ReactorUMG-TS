"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpacerConverter = void 0;
const UE = require("ue");
const umg_converter_1 = require("../umg_converter");
class SpacerConverter extends umg_converter_1.UMGConverter {
    constructor(typeName, props, outer) {
        super(typeName, props, outer);
    }
    createNativeWidget() {
        const spacer = new UE.Spacer(this.outer);
        const size = this.props?.size;
        if (size) {
            spacer.Size.X = size.x;
            spacer.Size.Y = size.y;
            UE.UMGManager.SynchronizeWidgetProperties(spacer);
        }
        return spacer;
    }
    update(widget, oldProps, changedProps) {
        const spacer = widget;
        const size = changedProps?.size;
        if (size) {
            spacer.Size.X = size.x;
            spacer.Size.Y = size.y;
            UE.UMGManager.SynchronizeWidgetProperties(spacer);
        }
    }
}
exports.SpacerConverter = SpacerConverter;
//# sourceMappingURL=Spacer.js.map