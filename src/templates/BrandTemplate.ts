import { CertificateDTO } from "../certificates/services/certificates.service";
import { CanvasRenderingContext2D, Image, loadImage, registerFont } from "canvas";
import logger from "winston";
import { IFont } from "../models/IFont";
import { IFlexImage } from "../models/IFlexImage";
import { ImagesService } from "../images/services/images.service";

export abstract class BrandTemplate {

    private readonly imagesService: ImagesService;
    constructor() {
        this.imagesService = new ImagesService();
    }
    /**
     * Function responsible for render the template according to the requirements of each brand
     * @param fromCertificate
     * @param use
     */
    abstract renderTemplate(fromCertificate: CertificateDTO, use: string): Promise<any>;

    /**
     * Try to load a "bunch" of images from a given design
     * Images with 'static' in the name will be loaded locally
     * All other images will be loaded from the bucket
     * 
     * @param imagesPaths
     */
    loadImages(imagesPaths: string[]): Promise<PromiseSettledResult<Image|void>[]> {
        logger.info(`BrandTemplate.loadImages: Will load images with paths: ${imagesPaths}`);

        const imagesPromises = imagesPaths.map((imagePath) => {
            this.imagesService.getCanvasImage(imagePath);
        });
        return Promise.allSettled(imagesPromises);
    }

    /**
     * Add images to canvas
     *
     * <strong>Order matters</strong>
     * @param context
     * @param results
     */
    addImagesToCanvas(context: CanvasRenderingContext2D, results: IFlexImage<Image>[]): void {
        results
            .filter(result => result.image.status === 'fulfilled')
            .forEach((result) => {
                try {
                    // Ignore because .value is not available from TS PromiseSettledResult type
                    //@ts-ignore
                    context.drawImage(result.image.value, result.coords.dx, result.coords.dy, result.coords.dw, result.coords.dh);
                } catch (error) {
                    logger.error(`Unable to add images with coords ${JSON.stringify(result.coords)} and value ${JSON.stringify(result.image)}`);
                }
            });
    }

    /**
     * Will load the desired fonts into canvas
     */
    loadFontsIntoCanvas(fontsPaths: IFont[]): void {
        fontsPaths.forEach((font) => {
            try {
                registerFont(font.path, font.fontFace);
            } catch (error) {
                logger.info("Interstate: " + error);
            }
        });
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
    wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }

        context.fillText(line, x, y);
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
