import { BrandTemplate } from "../BrandTemplate";
import { ImagesConfigs } from "../../images/images.configs";
import { createCanvas, Image, loadImage, registerFont } from "canvas";
import logger from "winston";
import { CertificateDTO } from "../../certificates/services/certificates.service";

export class DefaultTemplate extends BrandTemplate {

    renderTemplate(fromCertificate: CertificateDTO, purpose: string): Promise<Buffer> {
        return new Promise<Buffer>((accept, reject) => {
            //find out if we're going to scale the image
            let scale = ImagesConfigs.SIZES.SCALE;
            logger.debug(`Drawing card ${fromCertificate.id} purpose ${purpose}`);
            const height = 1350;

            // Load Fonts
            this.loadDefaultFontsIntoCanvas();
            const canvas = createCanvas(900, height);


            const context = canvas.getContext('2d');
            context.patternQuality = 'good';
            context.quality = 'good';

            //Load all required images in parallel before drawing them on the canvas
            this.loadImages([
                './static/backgrounds/card.front.default.v3.jpg',
                `brand.v2.default.${fromCertificate.brandCode}.png`,
                `sku.v1.default.${fromCertificate.stockKeepingUnitCode}.png`,
                './static/backgrounds/card.front.glass.v2.png',
            ]).then((images) => {
                //draw the images first
                const backgroundImage = images[0];
                if (backgroundImage.status == 'fulfilled') {
                    context.drawImage(backgroundImage.value, 0, 0);
                } else {
                    logger.info('Failed to load background image image:');
                }
                const skuImage = images[2];
                if (skuImage.status == 'fulfilled') {
                    const imageDimensions = this.scaleToMax(600, 776, skuImage.value);
                    context.drawImage(skuImage.value, 450 - imageDimensions[0] / 2, 675 - imageDimensions[1]/2, imageDimensions[0], imageDimensions[1]);
                } else {
                    logger.info('Failed to load sku image: ' + fromCertificate.stockKeepingUnitCode);
                }
                const brandImage = images[1];
                if (brandImage.status == 'fulfilled') {
                    const imageDimensions = this.scaleToMax(482, 312, brandImage.value);
                    context.drawImage(brandImage.value, 450 - imageDimensions[0] / 2, 230 - imageDimensions[1]/2, imageDimensions[0], imageDimensions[1]);
                } else {
                    logger.info('Failed to load brand image: ' + fromCertificate.brandCode);
                }

                //write the text
                context.fillStyle = ImagesConfigs.TEXT_RGB;
                context.font = '35pt JostSemi';
                context.textAlign = 'left';
                context.fillText(fromCertificate.stockKeepingUnitName, 100, 1040);

                context.font = '35pt OCR-A';
                var qty = this.getItemNumberText(fromCertificate.maxQty, fromCertificate.saleQty);
                context.fillText(qty, 100, 1100);

                if (fromCertificate?.test) {
                    context.fillStyle = 'rgb(118,188,127)';
                    context.font = '42pt OCR-A';
                    context.fillText('TEST CERTIFICATE ONLY', 200, 175);
                }
                
                const glassImage = images[3];
                if (glassImage.status == 'fulfilled') {
                    context.drawImage(glassImage.value, 0, 0);
                } else {
                    logger.info('Failed to load glass image:');
                }

                if(purpose == 'og'){
                    canvas = this.convertToOg(canvas);
                }

                if(purpose == 'thumb'){
                    canvas = this.convertToThumb(canvas);
                }

            }).catch(err => {
                console.error(err);
                logger.info(err);
                reject(err);
            }).finally(() => {
                if (scale != 1) {
                    try {
                        //cache the image on a temp canvas as resizing the canvas will
                        const tempCanvas = createCanvas(ImagesConfigs.SIZES.DEFAULT, height);
                        tempCanvas.getContext("2d").drawImage(canvas, 0, 0);
                        canvas.width *= scale;
                        canvas.height *= scale;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(tempCanvas, 0, 0, ImagesConfigs.SIZES.DEFAULT, height, 0, 0, ImagesConfigs.SIZES.DEFAULT * scale, height * scale);
                        logger.info("Scaled to " + scale);
                    } catch (error) {
                        logger.info(error);
                        reject(error);
                    }
                }

                accept(canvas.toBuffer());
            });
        });
    }
}
