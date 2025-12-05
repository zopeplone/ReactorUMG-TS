"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageLoader = void 0;
const puerts_1 = require("puerts");
const UE = require("ue");
class ImageLoader {
    static loadTextureFromImagePath(imagePath) {
        // todo@Caleb196x: 定制化导入函数，传入参数为相对于Content/JavaScript的绝对路径名，提高导入性能
        const texture = UE.KismetRenderingLibrary.ImportFileAsTexture2D(null, imagePath);
        if (texture) {
            return texture;
        }
        else {
            console.warn(`Failed to load texture from image path: ${imagePath}`);
        }
        return undefined;
    }
    static loadBrushImageObject(object, imagePath, dirName, syncLoad, onLoad, onError) {
        if (!syncLoad) {
            syncLoad = false;
        }
        const OnLoadDelegate = (0, puerts_1.toDelegate)(object, onLoad);
        const OnErrorDelegate = (0, puerts_1.toDelegate)(object, onError);
        UE.UMGManager.LoadBrushImageObject(imagePath, OnLoadDelegate, OnErrorDelegate, object ? object : null, syncLoad, dirName ? dirName : "");
    }
}
exports.ImageLoader = ImageLoader;
//# sourceMappingURL=image_loader.js.map