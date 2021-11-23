
import { BrandTemplate } from "../../BrandTemplate";
import { ImagesConfigs } from "../../../images/images.configs";
import { Canvas, createCanvas, Image, loadImage, registerFont } from "canvas";
import { logger } from '../../../logger'
import { CertificateDTO } from "../../../certificates/services/certificates.service";
import { Context } from "node:vm";

export class DefaultTemplate extends BrandTemplate<CertificateDTO> {

    async renderTemplate(fromCertificate: CertificateDTO, use: string): Promise<Canvas> {

        const MARGIN = 100;
        const RCOL = 570;
        const WIDTH = 1080;
        const HEIGHT = 1500;
        const SPACE = 50;
        let canvas = createCanvas(WIDTH, HEIGHT);

        // Load Fonts
        this.loadDefaultFontsIntoCanvas();

        const context = canvas.getContext('2d');
        context.patternQuality = 'good';
        context.quality = 'good';

        //Load all required images in parallel before drawing them on the canvas
        let images = await this.loadImages([
            './static/backgrounds/cert.front.default.v1.jpg',
            `brand.${fromCertificate.certVersion}.cert.${fromCertificate.brandCode}.png`,
            `sku.${fromCertificate.certVersion}.cert.${fromCertificate.stockKeepingUnitCode}.png`,
        ]);
        //draw the images firstx
        const backgroundImage = images[0];
        if (backgroundImage.status == 'fulfilled') {
            context.drawImage(backgroundImage.value, 0, 0);
        } else {
            logger.info('Failed to load background image image:');
        }
        const brandImage = images[1];
        if (brandImage.status == 'fulfilled') {
            const imageDimensions = this.scaleToMax(1080, 1500, brandImage.value);
            context.drawImage(brandImage.value, 0, 0, imageDimensions[0], imageDimensions[1]);
        } else {
            logger.info('Failed to load brand image: ' + fromCertificate.brandCode);
        }
        const skuImage = images[2];
        if (skuImage.status == 'fulfilled') {
            const imageDimensions = this.scaleToMax(1080, 1500, skuImage.value);
            context.drawImage(skuImage.value, 0, 0, imageDimensions[0], imageDimensions[1]);
        } else {
            logger.info('Failed to load sku image: ' + fromCertificate.stockKeepingUnitCode);
        }

        //write the text
        context.fillStyle = 'rgb(29,29,27)';
        context.font = '24pt ShareTechMono-Regular';
        let Y: number = MARGIN + 30;
        Y = Y + writeText(context, fromCertificate.stockKeepingUnitName, RCOL, Y);
        var qty = this.getItemNumberText(fromCertificate.maxQty, fromCertificate.saleQty, fromCertificate.stockKeepingUnitRarity);
        Y = Y + writeText(context, 'ITEM NUMBER ' + qty, RCOL, Y + SPACE);
        Y = Y + writeText(context, 'OWNERSHIP TOKEN ' + fromCertificate.thumbprint, RCOL, Y + SPACE * 2);
 
        if (fromCertificate.description.length > 250) { context.font = '22pt Minion'; } else { context.font = '24pt Minion'; }
        this.wrapText(context, fromCertificate.description, MARGIN, 750, 880, 30);

        this.writeTestWatermark(context);

        canvas = this.scale(canvas, 2);

        if (use == 'thumb') {
            canvas = this.convertToThumb(canvas);
        }

        return canvas;

        function writeText(context: Context, text: String, x: number, y: number): number {
            let wrap = 0;
            const space = 32;
            if (text.length > 15) {
                const words = text.split(' ');
                let line = '';
                for (let n = 0; n < words.length; n++) {
                    if (line.length + words[n].length > 15) {
                        context.fillText(line.toUpperCase(), x, y + wrap);
                        wrap = wrap + space;
                        line = words[n] + ' ';
                    } else {
                        line = line + words[n] + ' '
                    }
                }
                context.fillText(line.toUpperCase(), x, y + wrap);
            } else {
                context.fillText(text.toUpperCase(), x, y);
            }
            return wrap;
        }
    }
}
