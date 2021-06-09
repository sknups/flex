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
            this.loadFontsIntoCanvas([
                { path: './static/fonts/Inter-Regular-slnt=0.ttf', fontFace: { family: "Inter" } },
                { path: './static/fonts/InterstateMonoLight.otf', fontFace: { family: "Interstate" } },
                { path: './static/fonts/OCR-A.ttf', fontFace: { family: "OCR-A" } },
            ]);

            const context = canvas.getContext('2d');
            context.patternQuality = 'bilinear';
            context.quality = 'bilinear';

            //Load all required images in parallel before drawing them on the canvas
            this.loadImages([
                './static/backgrounds/card.back.default.v1.png',
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
                //write the text
                context.fillStyle = 'rgb(248,34,41)';
                context.font = '16pt OCR-A';
                context.textAlign = 'center';
                context.fillText(fromCertificate.gamerTag, 150, 120);
                context.fillText(`Item number ${fromCertificate.saleQty}/${fromCertificate.maxQty}`, 450, 120);
                
                context.fillText(fromCertificate.id, 150, 240);
                context.fillText(`For use in ${fromCertificate.platformName}`, 450, 240);

                context.fillText('Collection data to be added later', 300, 360);
                
                context.textAlign = 'left';
                this.wrapText(context, fromCertificate.description, 60, 420, 450, 30);


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
