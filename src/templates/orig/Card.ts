import { BrandTemplate } from "../BrandTemplate";
import { ImagesConfigs } from "../../images/images.configs";
import { createCanvas, Image, loadImage, registerFont } from "canvas";
import logger from "winston";
import { CertificateDTO } from "../../certificates/services/certificates.service";

export class DefaultTemplate extends BrandTemplate {

    scaleToMax(maxWidth: number, maxHeight: number, image: any): number[] {
        const boxAspectRatio: number = maxWidth / maxHeight;
        const imageAspectRatio: number = image.width / image.height;
        const scaleFactor = boxAspectRatio >= imageAspectRatio ? maxHeight / image.height : maxWidth / image.width;

        return [image.width * scaleFactor, image.height * scaleFactor];
    }

    renderTemplate(fromCertificate: CertificateDTO, use: string): Promise<Buffer> {
        return new Promise<Buffer>((accept, reject) => {
            //find out if we're going to scale the image
            let scale = ImagesConfigs.SIZES.SCALE;
            if (use == "og") {
                scale = ImagesConfigs.SIZES.OG / ImagesConfigs.SIZES.DEFAULT;
            } else if (use == "twitter") {
                scale = ImagesConfigs.SIZES.TWITTER / ImagesConfigs.SIZES.DEFAULT;
            }

            //Lock ratio to golden section
            //const height = ImagesConfigs.SIZES.DEFAULT / ImagesConfigs.LANDSCAPE_RATIO;
            //const canvas = createCanvas(ImagesConfigs.SIZES.DEFAULT, height);
            const height = 900;
            const canvas = createCanvas(600, height);


            // Load Fonts
            this.loadDefaultFontsIntoCanvas();

            const context = canvas.getContext('2d');
            context.patternQuality = 'bilinear';
            context.quality = 'bilinear';

            //Load all required images in parallel before drawing them on the canvas
            this.loadImages([
                './static/backgrounds/card.front.default.v1.png',
                `brand.v1.default.${fromCertificate.brandCode}.png`,
                `platform.v1.default.${fromCertificate.platformCode}.png`,
                `sku.v1.default.${fromCertificate.stockKeepingUnitCode}.png`,
            ]).then((images) => {
                //draw the images first
                const backgroundImage = images[0];
                if (backgroundImage.status == 'fulfilled') {
                    context.drawImage(backgroundImage.value, 0, 0);
                } else {
                    logger.info('Failed to load background image image:');
                }
                const skuImage = images[3];
                if (skuImage.status == 'fulfilled') {
                    const imageDimensions = this.scaleToMax(540, 540, skuImage.value);
                    context.drawImage(skuImage.value, 300 - imageDimensions[0] / 2, 400 - imageDimensions[1]/2, imageDimensions[0], imageDimensions[1]);
                } else {
                    logger.info('Failed to load sku image: ' + fromCertificate.stockKeepingUnitCode);
                }
                const brandImage = images[1];
                if (brandImage.status == 'fulfilled') {
                    const imageDimensions = this.scaleToMax(540, 150, brandImage.value);
                    context.drawImage(brandImage.value, 300 - imageDimensions[0] / 2, 750 - imageDimensions[1]/2, imageDimensions[0], imageDimensions[1]);
                } else {
                    logger.info('Failed to load brand image: ' + fromCertificate.brand);
                }
                const gameImage = images[2];
                if (gameImage.status == 'fulfilled') {
                    const imageDimensions = this.scaleToMax(220, 80, gameImage.value);
                    context.drawImage(gameImage.value, 480 - imageDimensions[0] / 2, 870 - imageDimensions[1], imageDimensions[0], imageDimensions[1]);
                } else {
                    logger.info('Failed to load game image: ' + fromCertificate.platformCode);
                }

                //write the text
                context.fillStyle = '#151515';
                context.font = '35pt JostSemi';
                context.textAlign = 'center';
                context.fillText(fromCertificate.stockKeepingUnitName, 300, 60);
                context.font = '30pt Jost';
                
                var qty = this.getItemNumberText(fromCertificate.maxQty, fromCertificate.saleQty);
                context.fillText(qty, 120, 870);

                if (fromCertificate?.test) {
                    context.fillStyle = 'rgb(118,188,127)';
                    context.font = '42pt OCR-A';
                    context.fillText('TEST CERTIFICATE ONLY', 200, 175);
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
