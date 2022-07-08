import { ItemDTO } from "../entities/services/entities.service";
import { CanvasRenderingContext2D, Canvas, Image, registerFont, createCanvas } from "canvas";
import {logger } from '../logger'
import { IFont } from "../models/IFont";
import { ImagesService } from "../images/services/images.service";
import { ImagesConfigs } from "../images/images.configs";

export abstract class BrandTemplate<T> {

    private readonly imagesService: ImagesService;
    constructor() {
        this.imagesService = new ImagesService();
    }

    /**
     * Checks that rarity is an int and returns 1 if it isn't
     * @param dto
     * @returns int 0 - 5
     */
    getRarity(dto: ItemDTO){
        return this.getSkuRarity(dto.stockKeepingUnitRarity, dto.stockKeepingUnitCode);
    }

    getSkuRarity(rarity: number, code: string){
        if(Number.isInteger(rarity) && 0 <= rarity && rarity <= 5){
            return rarity;
        } else {
            logger.warn(`${code} has invalid rarity: returning 1`);
            return 1;
        }
    }

    getItemNumberText(maximum: number, issue: number, rarity: number) {
        if (rarity === 0) return ''
        if (rarity === 1) return issue
        if (rarity > 1) return issue + '/' + maximum
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
     * This will convert the image to a ImagesConfigs.SIZES.OG px square with the a transparent background and the image vertically centered
     */
    convertToOg(canvas: Canvas): Canvas {
        return this.convertToSquare(canvas, ImagesConfigs.SIZES.OG);
    }

     /**
     * This will convert the image to a ImagesConfigs.SIZES.SNAP px square
     */
    convertToSnapchatSticker(canvas: Canvas): Canvas {
      return this.convertToSquare(canvas, ImagesConfigs.SIZES.SNAP_STICKER);
    }

     /**
     * This will convert the image to a square of size
     */
    convertToSquare(canvas: Canvas, size: number): Canvas {
        try {
            const tempCanvas = createCanvas(size, size);
            const scaled = this.scaleToMax(size, size, canvas);
            tempCanvas.getContext("2d").drawImage(canvas, (size - scaled[0]) / 2, 0, scaled[0], scaled[1]);
            logger.info(`Converted to square ${size}`);
            return tempCanvas;
        } catch (error) {
            logger.error("Failed to convert canvas to SNAP_STICKER: " + error);
            return canvas;
        }
    }

    /**
     * This will scale the image by ImagesConfigs.SIZES.THUMB
     */
    convertToThumb(canvas: Canvas): Canvas {
        return this.scale(canvas, ImagesConfigs.SIZES.THUMB);
    }

    /**
     * This will scale the image by ImagesConfigs.SIZES.THUMB
     */
    scale(canvas: Canvas, scale: number): Canvas {
        try {
            const w = canvas.width / scale;
            const h = canvas.height / scale;
            const tempCanvas = createCanvas(w, h);
            tempCanvas.getContext("2d").drawImage(canvas, 0, 0, w, h);
            logger.info("Converted to thumb");
            return tempCanvas;
        } catch (error) {
            logger.error("Failed to convert canvas to thumb: " + error);
            return canvas;
        }
    }

    /**
     * Utility method to work out the maximum size of an image we are scaling
     * @param maxWidth
     * @param maxHeight
     * @param image
     * @returns
     */
    scaleToMax(maxWidth: number, maxHeight: number, image: any): number[] {
        const boxAspectRatio: number = maxWidth / maxHeight;
        const imageAspectRatio: number = image.width / image.height;
        const scaleFactor = boxAspectRatio >= imageAspectRatio ? maxHeight / image.height : maxWidth / image.width;

        return [image.width * scaleFactor, image.height * scaleFactor];
    }

    loadDefaultFontsIntoCanvas() {
        this.loadFontsIntoCanvas([
            { path: './static/fonts/Jost-Regular-400.ttf', fontFace: { family: "Jost" } },
            { path: './static/fonts/Jost-SemiBold-600.ttf', fontFace: { family: "JostSemi" } },
            { path: './static/fonts/ShareTechMono-Regular.ttf', fontFace: { family: "ShareTechMono-Regular" } },
            { path: './static/fonts/CrimsonText-Regular.ttf', fontFace: { family: "Minion" } },
        ]);
    }
    /**
     *
     * Will load the desired fonts into canvas
     */
    loadFontsIntoCanvas(fontsPaths: IFont[]): void {
        fontsPaths.forEach((font) => {
            try {
                registerFont(font.path, font.fontFace);
            } catch (err) {
                logger.info(`Font error: ${font.path} ${err}`);
            }
        });
    }

    wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, center: boolean = false) {
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                if (center) {
                  context.textAlign = "center";
                }
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }

        const oldtextAlign = context.textAlign
        if (center) {
          context.textAlign = "center";
        }

        context.fillText(line, x, y);
        context.textAlign = oldtextAlign;
    }

}
