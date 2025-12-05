"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaleBoxConverter = void 0;
const UE = require("ue");
const umg_converter_1 = require("../umg_converter");
class ScaleBoxConverter extends umg_converter_1.UMGConverter {
    constructor(typeName, props, outer) {
        super(typeName, props, outer);
    }
    parseStretch(stretch, scale) {
        let stretchType = UE.EStretch.None;
        switch (stretch) {
            case 'contain':
                stretchType = UE.EStretch.ScaleToFit;
                break;
            case 'cover':
                stretchType = UE.EStretch.ScaleToFill;
                break;
            case 'fill':
                stretchType = UE.EStretch.Fill;
                break;
            case 'scale-y':
                stretchType = UE.EStretch.ScaleToFitY;
                break;
            case 'scale-x':
                stretchType = UE.EStretch.ScaleToFitX;
                break;
            case 'custom':
                stretchType = UE.EStretch.UserSpecified;
                break;
        }
        if (scale && stretch === 'custom') {
            return {
                Stretch: stretchType,
                UserSpecifiedScale: scale
            };
        }
        return {
            Stretch: stretchType
        };
    }
    initScaleBoxProps(scaleBox, props) {
        const stretch = props?.stretch;
        const scale = props?.scale;
        if (stretch) {
            const { Stretch, UserSpecifiedScale } = this.parseStretch(stretch, scale);
            scaleBox.SetStretch(Stretch);
            if (UserSpecifiedScale) {
                scaleBox.SetUserSpecifiedScale(UserSpecifiedScale);
            }
        }
    }
    createNativeWidget() {
        const scaleBox = new UE.ScaleBox(this.outer);
        this.initScaleBoxProps(scaleBox, this.props);
        return scaleBox;
    }
    update(widget, oldProps, changedProps) {
        const scaleBox = widget;
        this.initScaleBoxProps(scaleBox, changedProps);
    }
}
exports.ScaleBoxConverter = ScaleBoxConverter;
//# sourceMappingURL=ScaleBox.js.map