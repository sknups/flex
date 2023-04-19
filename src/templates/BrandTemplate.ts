import {logger} from '../logger'
import {Canvas, createCanvas, Image, CanvasRenderingContext2D, registerFont} from "canvas";
import {ImagesService} from "../images/services/images.service";
import {ImagesConfigs} from "../images/images.configs";

/**
 * How text should be printed.
 */
export interface Style {
    color: string,
    font: string,
    align: string,
}

export abstract class BrandTemplate<T> {

    constructor(
        protected readonly imagesService: ImagesService
    ) {}

    // this is invoked "reflectively" from ImagesService.generateCanvasImage
    // noinspection JSUnusedGlobalSymbols
    /**
     * Function responsible for render the template according to the requirements of each brand
     * @param dto The DTO for the entity
     * @param purpose The use intended for the image: handed in as part of the URL. default/any=full size: og=small square:
     * @param type The type being rendered not always required as types usually have separate templates e.g card and back
     */
    abstract renderTemplate(dto: T, purpose: string, type?: string): Promise<Canvas>;

     /**
     * Try to load a "bunch" of images from a given design
     * Images with 'static' in the name will be loaded locally
     * All other images will be loaded from the bucket
     *
     * @param imagesPaths
     */
    loadImages(imagesPaths: string[]): Promise<PromiseSettledResult<Image>[]> {
        logger.debug(`BrandTemplate.loadImages: Will load images with paths: ${imagesPaths}`);

        const imagesPromises = imagesPaths.map((imagePath) => {
            return this.imagesService.getCanvasImage(imagePath);
        });
        return Promise.allSettled(imagesPromises);
    }

    async draw(context: CanvasRenderingContext2D, filename: string, width: number, height: number) {

        const image = (await this.loadImages([filename]))[0];

        if (image.status === 'fulfilled') {
            const dimensions = this.scaleToMax(width, height, image.value);
            context.drawImage(image.value, 0, 0, dimensions[0], dimensions[1]);
        } else {
            logger.error(`Failed to load ${filename}`);
        }

    }

    /**
     * Print text onto the canvas.
     */
    print(context: CanvasRenderingContext2D, style: Style, text: string, x: number, y: number): void {
        context.textAlign = style.align as CanvasTextAlign;
        context.font = style.font;
        context.fillStyle = style.color;
        context.fillText(text, x, y);
    }

    /**
     * Convert the image to a 383px square.
     */
    convertToOg(canvas: Canvas): Canvas {
        return this.convertToSquare(canvas, ImagesConfigs.SIZES.OG);
    }

     /**
     * Convert the image to a 400px square.
     */
    convertToSnapchatSticker(canvas: Canvas): Canvas {
      return this.convertToSquare(canvas, ImagesConfigs.SIZES.SNAP_STICKER);
    }

     /**
     * Convert the image to square with specified edge length.
     */
    convertToSquare(canvas: Canvas, length: number): Canvas {
        try {
            const tempCanvas = createCanvas(length, length);
            const scaled = this.scaleToMax(length, length, canvas);
            tempCanvas.getContext("2d").drawImage(canvas, (length - scaled[0]) / 2, 0, scaled[0], scaled[1]);
            logger.debug(`Converted to square ${length}×${length}`);
            return tempCanvas;
        } catch (error) {
            logger.error("Failed to convert canvas to square! " + error);
            return canvas;
        }
    }

    /**
     * Reduce size of specified image by factor 10×
     */
    convertToThumb(canvas: Canvas): Canvas {
        return this.reduce(canvas, ImagesConfigs.SIZES.THUMB);
    }

    /**
     * Reduce size of specified image by specified factor
     */
    reduce(canvas: Canvas, factor: number): Canvas {
        try {
            const w = canvas.width / factor;
            const h = canvas.height / factor;
            const tempCanvas = createCanvas(w, h);
            tempCanvas.getContext("2d").drawImage(canvas, 0, 0, w, h);
            logger.debug(`Converted to thumb ${w}×${h}`);
            return tempCanvas;
        } catch (error) {
            logger.error("Failed to convert canvas to thumb! " + error);
            return canvas;
        }
    }

    /**
     * Utility method to work out the maximum size of an image we are scaling
     */
    scaleToMax(maxWidth: number, maxHeight: number, image: any): number[] {
        const boxAspectRatio: number = maxWidth / maxHeight;
        const imageAspectRatio: number = image.width / image.height;
        const scaleFactor = boxAspectRatio >= imageAspectRatio ? maxHeight / image.height : maxWidth / image.width;

        return [image.width * scaleFactor, image.height * scaleFactor];
    }

    private static FONTS_REGISTERED = false;

    /**
     * Register (non-system) fonts for subsequent use in canvas drawing.
     */
    public static registerFonts() {
        if (!BrandTemplate.FONTS_REGISTERED) {
            for (const font of [
                {path: './static/fonts/Jost-Regular-400.ttf', family: 'Jost', weight: 'Regular'},
                {path: './static/fonts/Jost-SemiBold-600.ttf', family: 'Jost', weight: 'Semibold'},
                {path: './static/fonts/ShareTechMono-Regular.ttf', family: 'Share Tech Mono', weight: 'Regular'},
                {path: './static/fonts/CrimsonText-Regular.ttf', family: 'Crimson Text', weight: 'Regular'},
            ]) {
                try {
                    registerFont(font.path, {family: font.family, weight: font.weight});
                } catch (err) {
                    logger.error(`Cannot register font! ${font.path} ${err}`);
                }
            }
            BrandTemplate.FONTS_REGISTERED = true
        }
    }

}
