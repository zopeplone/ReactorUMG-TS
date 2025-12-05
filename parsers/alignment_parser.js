"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWidgetSelfAlignment = parseWidgetSelfAlignment;
exports.parseFlexHorizontalAlignmentActions = parseFlexHorizontalAlignmentActions;
exports.parseFlexVerticalAlignmentActions = parseFlexVerticalAlignmentActions;
const UE = require("ue");
const css_margin_parser_1 = require("./css_margin_parser");
const HORIZONTAL_ALIGN_MAP = {
    start: UE.EHorizontalAlignment.HAlign_Left,
    left: UE.EHorizontalAlignment.HAlign_Left,
    "flex-start": UE.EHorizontalAlignment.HAlign_Left,
    end: UE.EHorizontalAlignment.HAlign_Right,
    right: UE.EHorizontalAlignment.HAlign_Right,
    "flex-end": UE.EHorizontalAlignment.HAlign_Right,
    center: UE.EHorizontalAlignment.HAlign_Center,
    stretch: UE.EHorizontalAlignment.HAlign_Fill
};
const VERTICAL_ALIGN_MAP = {
    start: UE.EVerticalAlignment.VAlign_Top,
    top: UE.EVerticalAlignment.VAlign_Top,
    "flex-start": UE.EVerticalAlignment.VAlign_Top,
    end: UE.EVerticalAlignment.VAlign_Bottom,
    bottom: UE.EVerticalAlignment.VAlign_Bottom,
    "flex-end": UE.EVerticalAlignment.VAlign_Bottom,
    center: UE.EVerticalAlignment.VAlign_Center,
    stretch: UE.EVerticalAlignment.VAlign_Fill
};
const getHorizontalAlignment = (value) => HORIZONTAL_ALIGN_MAP[value] ?? UE.EHorizontalAlignment.HAlign_Center;
const getVerticalAlignment = (value) => VERTICAL_ALIGN_MAP[value] ?? UE.EVerticalAlignment.VAlign_Center;
function parseWidgetSelfAlignment(style) {
    const alignment = {
        horizontal: UE.EHorizontalAlignment.HAlign_Fill,
        vertical: UE.EVerticalAlignment.VAlign_Fill,
        padding: new UE.Margin(0, 0, 0, 0)
    };
    const flexDirection = style?.flexDirection ?? "row";
    const justifySelf = style?.justifySelf;
    if (justifySelf) {
        alignment.horizontal = getHorizontalAlignment(justifySelf);
    }
    const padding = (0, css_margin_parser_1.convertPadding)(style);
    if (padding) {
        alignment.padding = padding;
    }
    const alignSelf = style?.alignSelf;
    if (!alignSelf) {
        return alignment;
    }
    if (flexDirection === "row") {
        alignment.vertical = getVerticalAlignment(alignSelf);
    }
    else {
        alignment.horizontal = getHorizontalAlignment(alignSelf);
    }
    return alignment;
}
function parseFlexHorizontalAlignmentActions() {
    return {
        justifySelf: {
            'flex-start': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'flex-end': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'left': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'right': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'start': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'end': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'center': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Center),
            'stretch': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Fill)
        },
        alignSelf: {
            'stretch': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Fill),
            'center': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Center),
            'flex-start': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'flex-end': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'start': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'end': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'top': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'bottom': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom)
        },
        spaceBetween: (slot, flex) => slot.SetSize(new UE.SlateChildSize(flex, UE.ESlateSizeRule.Fill))
    };
}
function parseFlexVerticalAlignmentActions() {
    return {
        justifySelf: {
            'flex-start': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'flex-end': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'start': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'end': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'left': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'right': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'center': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Center),
            'stretch': (slot) => slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Fill)
        },
        alignSelf: {
            'stretch': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Fill),
            'center': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Center),
            'flex-start': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'flex-end': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'start': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'end': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'top': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'bottom': (slot) => slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right)
        },
        spaceBetween: (slot, flex) => slot.SetSize(new UE.SlateChildSize(flex, UE.ESlateSizeRule.Fill))
    };
}
//# sourceMappingURL=alignment_parser.js.map