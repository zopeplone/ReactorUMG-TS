"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBrush = parseBrush;
const UE = require("ue");
const css_color_parser_1 = require("./css_color_parser");
const image_loader_1 = require("../misc/image_loader");
const css_margin_parser_1 = require("./css_margin_parser");
function parseBrush(imageStyle) {
    const brush = new UE.SlateBrush();
    const tintColor = (0, css_color_parser_1.parseToLinearColor)(imageStyle.color);
    if (tintColor) {
        brush.TintColor = new UE.SlateColor();
        brush.TintColor.SpecifiedColor.R = tintColor.r;
        brush.TintColor.SpecifiedColor.G = tintColor.g;
        brush.TintColor.SpecifiedColor.B = tintColor.b;
        brush.TintColor.SpecifiedColor.A = tintColor.a;
    }
    const drawType = imageStyle?.drawType;
    if (drawType) {
        switch (drawType) {
            case 'box':
                brush.DrawAs = UE.ESlateBrushDrawType.Box;
                break;
            case 'border':
                brush.DrawAs = UE.ESlateBrushDrawType.Border;
                break;
            case 'image':
                brush.DrawAs = UE.ESlateBrushDrawType.Image;
                break;
            case 'rounded-box':
                brush.DrawAs = UE.ESlateBrushDrawType.RoundedBox;
                break;
            case 'none':
                brush.DrawAs = UE.ESlateBrushDrawType.NoDrawType;
                break;
            default:
                console.warn(`Invalid draw type: ${drawType}`);
                brush.DrawAs = UE.ESlateBrushDrawType.Image;
                break;
        }
    }
    const tiling = imageStyle?.tiling;
    if (tiling) {
        switch (tiling) {
            case 'repeat':
                brush.Tiling = UE.ESlateBrushTileType.Both;
                break;
            case 'repeat-x':
                brush.Tiling = UE.ESlateBrushTileType.Horizontal;
                break;
            case 'repeat-y':
                brush.Tiling = UE.ESlateBrushTileType.Vertical;
                break;
            case 'no-repeat':
                brush.Tiling = UE.ESlateBrushTileType.NoTile;
                break;
            default:
                console.warn(`Invalid tiling type: ${tiling}`);
                brush.Tiling = UE.ESlateBrushTileType.NoTile;
                break;
        }
    }
    const padding = imageStyle?.padding;
    if (padding) {
        brush.Margin = (0, css_margin_parser_1.convertPadding)(imageStyle);
    }
    const margin = imageStyle?.margin;
    if (margin) {
        brush.Margin = (0, css_margin_parser_1.convertMargin)(imageStyle);
    }
    // todo@Caleb196x: 处理Image
    const image = imageStyle?.image;
    if (image) {
        if (typeof image === 'string') {
            const resourceObject = image_loader_1.ImageLoader.loadTextureFromImagePath(image);
            if (resourceObject) {
                brush.ResourceObject = resourceObject;
            }
        }
        else if (typeof image === 'object') {
            const resourceObject = image;
            brush.ResourceObject = resourceObject;
        }
        const imageSize = imageStyle?.imageSize;
        if (imageSize) {
            brush.ImageSize = new UE.DeprecateSlateVector2D();
            imageSize.x = imageSize.x;
            imageSize.y = imageSize.y;
        }
    }
    // todo@Caleb196x: 处理OutlineSetting
    const outline = imageStyle?.outline;
    if (outline) {
        const brushOutlineSetting = new UE.SlateBrushOutlineSettings();
        const cornerRadio = outline.cornerRadio;
        if (cornerRadio) {
            brushOutlineSetting.CornerRadii.X = cornerRadio.top;
            brushOutlineSetting.CornerRadii.Y = cornerRadio.bottom;
            brushOutlineSetting.CornerRadii.Z = cornerRadio.left;
            brushOutlineSetting.CornerRadii.W = cornerRadio.right;
        }
        const outlineColor = outline.outlineColor;
        if (outlineColor) {
            const parsedOutlineColor = (0, css_color_parser_1.parseToLinearColor)(outlineColor);
            brushOutlineSetting.Color.SpecifiedColor.R = parsedOutlineColor.r;
            brushOutlineSetting.Color.SpecifiedColor.G = parsedOutlineColor.g;
            brushOutlineSetting.Color.SpecifiedColor.B = parsedOutlineColor.b;
            brushOutlineSetting.Color.SpecifiedColor.A = parsedOutlineColor.a;
        }
        const width = outline.width;
        if (width) {
            brushOutlineSetting.Width = width;
        }
        const type = outline.type;
        if (type) {
            switch (type) {
                case 'fix-radius':
                    brushOutlineSetting.RoundingType = UE.ESlateBrushRoundingType.FixedRadius;
                    break;
                case 'half-height-radius':
                    brushOutlineSetting.RoundingType = UE.ESlateBrushRoundingType.HalfHeightRadius;
                    break;
                default:
                    console.warn(`Invalid outline type: ${type}`);
                    brushOutlineSetting.RoundingType = UE.ESlateBrushRoundingType.FixedRadius;
                    break;
            }
        }
        brush.OutlineSettings = brushOutlineSetting;
    }
    return brush;
}
//# sourceMappingURL=brush_parser.js.map