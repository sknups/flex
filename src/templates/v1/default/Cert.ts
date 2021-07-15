
import { BrandTemplate } from "../../BrandTemplate";
import { ImagesConfigs } from "../../../images/images.configs";
import { createCanvas, Image, loadImage, registerFont } from "canvas";
import { logger } from '../../../logger'
import { CertificateDTO } from "../../../certificates/services/certificates.service";
import { Context } from "node:vm";

export class DefaultTemplate extends BrandTemplate {

    renderTemplate(fromCertificate: CertificateDTO, use: string): Promise<Buffer> {
        return new Promise<Buffer>((accept, reject) => {
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
            this.loadImages([
                './static/backgrounds/cert.front.default.v1.jpg',
                `brand.v1.default.${fromCertificate.brandCode}.png`,
                `sku.v1.default.${fromCertificate.stockKeepingUnitCode}.png`,
            ]).then((images) => {
                //draw the images firstx
                const backgroundImage = images[0];
                if (backgroundImage.status == 'fulfilled') {
                    context.drawImage(backgroundImage.value, 0, 0);
                } else {
                    logger.info('Failed to load background image image:');
                }
                const brandImage = images[1];
                if (brandImage.status == 'fulfilled') {
                    const imageDimensions = this.scaleToMax(880, 254, brandImage.value);
                    context.drawImage(brandImage.value, WIDTH / 2 - imageDimensions[0] / 2, 1050 - imageDimensions[1] / 2, imageDimensions[0], imageDimensions[1]);
                } else {
                    logger.info('Failed to load brand image: ' + fromCertificate.brandCode);
                }
                const skuImage = images[2];
                if (skuImage.status == 'fulfilled') {
                    const imageDimensions = this.scaleToMax(440, 586, skuImage.value);
                    context.drawImage(skuImage.value, MARGIN + 220 - imageDimensions[0] / 2, MARGIN + 283 - imageDimensions[1] / 2, imageDimensions[0], imageDimensions[1]);
                } else {
                    logger.info('Failed to load sku image: ' + fromCertificate.stockKeepingUnitCode);
                }

                //write the text
                context.fillStyle = 'rgb(29,29,27)';
                context.font = '24pt OCR-A';
                let Y: number = MARGIN + 30;
                Y = Y + writeText(context, fromCertificate.stockKeepingUnitName, RCOL, Y);
                Y = Y + writeText(context, 'ITEM ' + fromCertificate.saleQty + ' OF ' + fromCertificate.maxQty, RCOL, Y + SPACE);
                Y = Y + writeText(context, 'OWNERSHIP TOKEN ' + fromCertificate.thumbprint, RCOL, Y + SPACE * 2);

                if (fromCertificate.description.length > 250) { context.font = '22pt Minion'; } else { context.font = '24pt Minion'; }
                this.wrapText(context, fromCertificate.description, MARGIN, 750, 880, 30);

                if (fromCertificate?.test) {
                    context.fillStyle = 'rgb(118,188,127)';
                    context.font = '42pt OCR-A';
                    context.fillText('TEST CERTIFICATE ONLY', 200, 175);
                }

                canvas = this.scale(canvas, 2);
            }).catch(err => {
                console.error(err);
                logger.info(err);
                reject(err);
            }).finally(() => {
                accept(canvas.toBuffer());
            });
        });

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
