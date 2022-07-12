import {logger} from '../logger'
import {Canvas, createCanvas, Image, registerFont} from "canvas";
import {ImagesService} from "../images/services/images.service";
import {ImagesConfigs} from "../images/images.configs";

export abstract class BrandTemplate<T> {

    private readonly imagesService: ImagesService = new ImagesService();

    getItemNumberText(maximum: number, issue: number, rarity: number): string {
        if (rarity === 0) return ''
        if (rarity === 1) return `${issue}`
        if (rarity > 1) return `${issue}/${maximum}`
        return ''
    }

    // this is invoked "reflectively" from ImagesService.generateCanvasImage
    // noinspection JSUnusedGlobalSymbols
    /**
     * Function responsible for render the template according to the requirements of each brand
     * @param dto The DTO for the entity
     * @param purpose The use intended for the image: handed in as part of the URL. default/any=full size: og=small square:
     */
    abstract renderTemplate(dto: T, purpose: string): Promise<Canvas>;

     /**
     * Try to load a "bunch" of images from a given design
     * Images with 'static' in the name will be loaded locally
     * All other images will be loaded from the bucket
     *
     * @param imagesPaths
     */
    loadImages(imagesPaths: string[]): Promise<PromiseSettledResult<Image | void>[]> {
        logger.info(`BrandTemplate.loadImages: Will load images with paths: ${imagesPaths}`);

        const imagesPromises = imagesPaths.map((imagePath) => {
            return this.imagesService.getCanvasImage(imagePath);
        });
        return Promise.allSettled(imagesPromises);
    }

    writeTestWatermark(context: CanvasRenderingContext2D) {
        if (process.env.SHOW_TEST_ONLY_WATERMARK === 'true') {
            context.save();
            context.fillStyle = ImagesConfigs.WATERMARK_COLOR;
            context.font = '32pt ShareTechMono-Regular';
            context.textAlign = 'center';
            context.rotate(-Math.PI / 4);
            context.fillText('TEST ONLY', -4, 140);
            context.restore();
        }
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
            logger.info(`Converted to thumb ${w}×${h}`);
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
                {path: './static/fonts/Jost-Regular-400.ttf', family: 'Jost'},
                {path: './static/fonts/Jost-SemiBold-600.ttf', family: 'JostSemi'},
                {path: './static/fonts/ShareTechMono-Regular.ttf', family: 'ShareTechMono-Regular'},
                {path: './static/fonts/CrimsonText-Regular.ttf', family: 'Minion'},
            ]) {
                try {
                    registerFont(font.path, {family: font.family});
                } catch (err) {
                    logger.error(`Cannot register font! ${font.path} ${err}`);
                }
            }
            BrandTemplate.FONTS_REGISTERED = true
        }
    }

}
