"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniformGridConverter = void 0;
const alignment_parser_1 = require("../parsers/alignment_parser");
const css_margin_parser_1 = require("../parsers/css_margin_parser");
const cssstyle_parser_1 = require("../parsers/cssstyle_parser");
const container_converter_1 = require("./container_converter");
const UE = require("ue");
class UniformGridConverter extends container_converter_1.ContainerConverter {
    constructor(typeName, props, outer) {
        super(typeName, props, outer);
    }
    initUniformGridProps(uniformGrid, props) {
        const minCellSize = props?.minCellSize;
        if (minCellSize) {
            uniformGrid.SetMinDesiredSlotWidth(minCellSize.x);
            uniformGrid.SetMinDesiredSlotHeight(minCellSize.y);
        }
        const cellPadding = props?.cellPadding;
        if (cellPadding) {
            let padding = null;
            if (typeof cellPadding === 'object') {
                padding = new UE.Margin(cellPadding.top, cellPadding.right, cellPadding.bottom, cellPadding.left);
            }
            else if (typeof cellPadding === 'string') {
                padding = (0, css_margin_parser_1.convertToUEMargin)(props?.style, cellPadding, '', '', '', '');
            }
            if (padding) {
                uniformGrid.SetSlotPadding(padding);
            }
        }
    }
    setupUniformGridSlot(slot, childTypeName, childProps) {
        const childStyle = (0, cssstyle_parser_1.getAllStyles)(childTypeName, childProps);
        const alignment = (0, alignment_parser_1.parseWidgetSelfAlignment)(childStyle);
        slot.SetHorizontalAlignment(alignment.horizontal);
        slot.SetVerticalAlignment(alignment.vertical);
        this.initChildPadding(slot, childStyle);
        const row = childStyle?.gridRow || 0;
        const column = childStyle?.gridColumn || 0;
        if (typeof row === 'string') {
            const rowIndex = parseFloat(row);
            if (!isNaN(rowIndex)) {
                slot.SetRow(rowIndex);
            }
        }
        else if (typeof row === 'number') {
            slot.SetRow(row);
        }
        if (typeof column === 'string') {
            const columnIndex = parseFloat(column);
            if (!isNaN(columnIndex)) {
                slot.SetColumn(columnIndex);
            }
        }
        else if (typeof column === 'number') {
            slot.SetColumn(column);
        }
    }
    createNativeWidget() {
        const uniformGrid = new UE.UniformGridPanel(this.outer);
        this.initUniformGridProps(uniformGrid, this.props);
        return uniformGrid;
    }
    update(widget, oldProps, changedProps) {
        const uniformGrid = widget;
        this.initUniformGridProps(uniformGrid, changedProps);
    }
    appendChild(parent, child, childTypeName, childProps) {
        const uniformGrid = parent;
        const slot = uniformGrid.AddChildToUniformGrid(child);
        this.setupUniformGridSlot(slot, childTypeName, childProps);
    }
}
exports.UniformGridConverter = UniformGridConverter;
//# sourceMappingURL=uniformgrid.js.map