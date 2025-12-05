"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiveConverter = void 0;
const UE = require("ue");
const umg_converter_1 = require("../umg_converter");
class RiveConverter extends umg_converter_1.UMGConverter {
    constructor(typeName, props, outer) {
        super(typeName, props, outer);
    }
    convertFitType(fitType) {
        switch (fitType) {
            case "contain":
                return UE.ERiveFitType.Contain;
            case "cover":
                return UE.ERiveFitType.Cover;
            case "fill":
                return UE.ERiveFitType.Fill;
            case "fit-width":
                return UE.ERiveFitType.FitWidth;
            case "fit-height":
                return UE.ERiveFitType.FitHeight;
            case "none":
                return UE.ERiveFitType.None;
            case "scale-down":
                return UE.ERiveFitType.ScaleDown;
            case "layout":
                return UE.ERiveFitType.Layout;
            default:
                return UE.ERiveFitType.Contain;
        }
    }
    convertAlignment(alignment) {
        switch (alignment) {
            case "top-left":
                return UE.ERiveAlignment.TopLeft;
            case "top-center":
                return UE.ERiveAlignment.TopCenter;
            case "top-right":
                return UE.ERiveAlignment.TopRight;
            case "center-left":
                return UE.ERiveAlignment.CenterLeft;
            case "center-right":
                return UE.ERiveAlignment.CenterRight;
            case "bottom-left":
                return UE.ERiveAlignment.BottomLeft;
            case "bottom-center":
                return UE.ERiveAlignment.BottomCenter;
            case "bottom-right":
                return UE.ERiveAlignment.BottomRight;
            case "center":
                return UE.ERiveAlignment.Center;
            default:
                return UE.ERiveAlignment.Center;
        }
    }
    initRiveProps(rive, props) {
        if (!rive) {
            return;
        }
        const artBoard = props?.artBoard || "";
        const artBoardIndex = props?.artBoardIndex || 0;
        const fitType = props?.fitType || "contain";
        const scale = props?.scale || 1.0;
        const alignment = props?.alignment || "center";
        const riveFile = props?.rive;
        if (riveFile) {
            const descriptor = new UE.RiveDescriptor();
            descriptor.RiveFile = UE.UMGManager.LoadRiveFile(rive, riveFile, __dirname);
            descriptor.ArtboardName = artBoard;
            descriptor.ArtboardIndex = artBoardIndex;
            descriptor.FitType = this.convertFitType(fitType);
            descriptor.ScaleFactor = scale;
            descriptor.Alignment = this.convertAlignment(alignment);
            rive.SetRiveDescriptor(descriptor);
        }
        const RiveReady = props?.onRiveReady;
        if (RiveReady) {
            rive.OnRiveReady.Add(RiveReady);
        }
        return;
    }
    createNativeWidget() {
        const Rive = UE.UMGManager.CreateWidget(this.outer, UE.RiveWidget.StaticClass());
        this.initRiveProps(Rive, this.props);
        return Rive;
    }
    update(widget, oldProps, changedProps) {
        const rive = widget;
        this.initRiveProps(rive, changedProps);
    }
}
exports.RiveConverter = RiveConverter;
//# sourceMappingURL=Rive.js.map