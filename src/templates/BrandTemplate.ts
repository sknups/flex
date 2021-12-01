import { CertificateDTO } from "../certificates/services/certificates.service";
import { CanvasRenderingContext2D, Canvas, Image, registerFont, createCanvas } from "canvas";
import {logger } from '../logger'
import { IFont } from "../models/IFont";
import { IFlexImage } from "../models/IFlexImage";
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
     * @returns int 1 - 5
     */
    getRarity(dto: CertificateDTO){
        return this.getSkuRarity(dto.stockKeepingUnitRarity, dto.stockKeepingUnitCode);
    }

    getSkuRarity(rarity: number, code: string){
        if(Number.isInteger(rarity) && 1 <= rarity && rarity <= 5){
            return rarity;
        } else {
            logger.warn(`${code} has invalid rarity: returning 1`);
            return 1;
        }
    }
    /**
     * What is the largets number of qtyAvailable we will show on a card?
     **/
    getItemNumberText(maxQty: number, saleQty: number, rarity: number) {
        return rarity > 1 ? saleQty + '/' + maxQty : saleQty;
    }
    /**
     * Function responsible for render the template according to the requirements of each brand
     * @param fromCertificate The DTO for the certificate
     * @param use The use intended for the image: handed in as part of the URL. default/any=full size: og=small square: 
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

    /**
     * 
     * @param canvas 
     * @returns 
     */
    writeTestWatermark(context: CanvasRenderingContext2D) {
        //TODO DRM-1220 - the data to drive this should be returned by the api
        if (process.env.ENVIRONMENT != 'prd') { 
            context.save();
            context.fillStyle = ImagesConfigs.TEXT_TEST;
            context.font = '32pt ShareTechMono-Regular';
            context.textAlign = 'center';
            context.rotate(-Math.PI / 4);
            context.fillText('TEST ONLY', -4, 140);
            context.restore();
        }
    }

    /**
     * This will convert the image to a ImagesConfigs.SIZES.OG px square with the a transparent background and the image vertically centered
     * @param context 
     */
    convertToOg(canvas: Canvas): Canvas {
        try {
            //cache the image on a temp canvas as resizing the canvas will
            const tempCanvas = createCanvas(ImagesConfigs.SIZES.OG, ImagesConfigs.SIZES.OG);
            var scaled = this.scaleToMax(ImagesConfigs.SIZES.OG, ImagesConfigs.SIZES.OG, canvas);
            tempCanvas.getContext("2d").drawImage(canvas, (ImagesConfigs.SIZES.OG - scaled[0]) / 2, 0, scaled[0], scaled[1]);
            logger.info("Converted to OG");
            return tempCanvas;
        } catch (error) {
            logger.error("Failed to convert canvas to OG: " + error);
            return canvas;
        }
    }

    /**
     * This will scale the image by ImagesConfigs.SIZES.THUMB
     * @param context 
     */
    convertToThumb(canvas: Canvas): Canvas {
        return this.scale(canvas, ImagesConfigs.SIZES.THUMB);
    }

    /**
     * This will scale the image by ImagesConfigs.SIZES.THUMB
     * @param context 
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

    

    wrapTextCentered(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
      return this.wrapText(context, text, x, y, maxWidth, lineHeight, true);
    }

    /**
     * Will try to wrap the text
     * @param context
     * @param text
     * @param x
     * @param y
     * @param maxWidth
     * @param lineHeight
     */
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

    /**
     *
     * @param object key value pair where key and value are strings
     * @param value the string value
     */
    getKeyByValue(object: { [key: string]: string }, value: string) {
        return Object.keys(object).find(key => object[key] === value);
    }
}
