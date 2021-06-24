import { BrandTemplate } from "../BrandTemplate";
import { ImagesConfigs } from "../../images/images.configs";
import { createCanvas, Image, loadImage, registerFont } from "canvas";
import {logger } from '../../logger'
import { CertificateDTO } from "../../certificates/services/certificates.service";
import { Context } from "node:vm";

export class DefaultTemplate extends BrandTemplate {

    scaleToMax(maxWidth: number, maxHeight: number, image: any): number[] {
        const boxAspectRatio: number = maxWidth / maxHeight;
        const imageAspectRatio: number = image.width / image.height;
        const scaleFactor = boxAspectRatio >= imageAspectRatio ? maxHeight / image.height : maxWidth / image.width;

        return [image.width * scaleFactor, image.height * scaleFactor];
    }

    writeText(ctx: Context, title: String, body: String, x:number, y:number){
        const lineDepth = 20;
        ctx.fillStyle = '#919191';
        ctx.fillText(title, x, y);
        ctx.fillStyle = '#edecec';
        ctx.fillText(body, x, y + 30);
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
                './static/backgrounds/card.back.default.v1.png',
                `brand.v1.default.${fromCertificate.brandCode}.png`,
            ]).then((images) => {
                //draw the images first
                const backgroundImage = images[0];
                if (backgroundImage.status == 'fulfilled') {
                    context.drawImage(backgroundImage.value, 0, 0);
                } else {
                    logger.info('Failed to load background image image:');
                }
                //write the text
                context.font = '22pt Jost';
                context.textAlign = 'center';
                this.writeText(context, 'Owner',fromCertificate.gamerTag, 150, 120);
                this.writeText(context, 'Item number',this.getItemNumberText(fromCertificate.maxQty, fromCertificate.saleQty),450,120);
                this.writeText(context, 'Ownership token', fromCertificate.thumbprint, 150, 240);
                this.writeText(context, 'For use in', fromCertificate.platformName, 450, 240);
                this.writeText(context, 'Collection', 'TBD',300, 360);
                
                this.writeText(context, 'Description', '',300, 550);
                this.wrapText(context, fromCertificate.description, 300, 580, 500, 30);

                if (fromCertificate?.test) {
                    context.fillStyle = 'rgb(118,188,127)';
                    context.font = '36pt OCR-A';
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
