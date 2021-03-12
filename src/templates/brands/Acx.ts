import {ITemplate} from "../ITemplate";
import {CertificateDTO} from "../../certificates/services/certificates.service";
import logger from "winston";
import {createCanvas, loadImage, registerFont} from "canvas";
import {ImagesConfigs} from "../../images/images.configs";

/**
 * Dynamic imported on ImagesService.ts
 */
export class Acx extends ITemplate {
    renderTemplate(fromCertificate: CertificateDTO, use: string): Promise<Buffer> {
        logger.info(`Acx.renderTemplate for ${fromCertificate.brandcode} and will use ${use}`);

        return new Promise<Buffer>((accept, reject) => {
            const platformImages = {
                nba2k:"NBA2K",
                gta:"GTA5",
                fortnite:"Fortnite",
                sims:"The Sims",
                valorant: "Valorant"
            };

            //find out if we're going to scale the image
            let scale = 1;
            if (use == "og") {
                scale = ImagesConfigs.SIZES.og / ImagesConfigs.SIZES.default;
            } else if (use == "twitter") {
                scale = ImagesConfigs.SIZES.twitter / ImagesConfigs.SIZES.default;
            }

            //Lock ratio to golden section
            const height = ImagesConfigs.SIZES.default / ImagesConfigs.LANDSCAPE_RATIO;

            // Just forcing a != size
            const canvas = createCanvas(250, 500);

            //Clean up fonts
            try {
                registerFont("./static/fonts/InterstateMonoLight.otf", { family: "Interstate" });
            } catch (error) {
                logger.info("Interstate: " + error);
            }

            try {
                registerFont('./static/fonts/Inter-Regular-slnt=0.ttf', { family: "Inter" });
            } catch (error) {
                logger.info("Inter: " + error);
            }

            try {
                registerFont('./static/fonts/OCR-A.ttf', { family: "OCR-A" });
            } catch (error) {
                logger.info("Inter: " + error);
            }

            const context = canvas.getContext('2d');
            context.patternQuality = 'bilinear';
            context.quality = 'bilinear';

            //Load all required images in parallel before drawing them on the canvas
            const backgroundPromise = loadImage('./static/SKNUPS_cert_bg.jpg'); //Change name - cert might confuse
            const brandPromise = loadImage('./static/brands/' + fromCertificate.brandcode + ".png");
            const gamePromise = loadImage('./static/games/' + this.getKeyByValue(platformImages, fromCertificate.platform) + ".png"); //TODO - Ugly, need gamecode
            const skuPromise = loadImage(fromCertificate.image);

            //@ts-ignore
            Promise.allSettled([backgroundPromise, brandPromise, gamePromise, skuPromise]).then((images) => {
                //draw the images first
                const backgroundImage = images[0];
                if (backgroundImage.status == 'fulfilled') { context.drawImage(backgroundImage.value, 0, 0); } else { logger.info('Failed to load background image image:'); }
                const brandImage = images[1];
                if (brandImage.status == 'fulfilled') { context.drawImage(brandImage.value, 325, 250, 150, 100); } else { logger.info('Failed to load brand image: ' + fromCertificate.brand); }
                const gameImage = images[2];
                if (gameImage.status == 'fulfilled') { context.drawImage(gameImage.value, 550, 250); } else { logger.info('Failed to load game image: ' + fromCertificate.platform); }
                const skuImage = images[3];
                if (skuImage.status == 'fulfilled') { context.drawImage(skuImage.value, 30, 30); } else { logger.info('Failed to load sku image: ' + fromCertificate.sku); }

                //write the text
                context.fillStyle = 'rgb(29,29,27)';
                context.font = '10pt Inter';
                this.wrapText(context, fromCertificate.description, 325, 100, 500, 30);
                context.font = '16pt OCR-A';
                context.fillText('ITEM ' + fromCertificate.sale_qty + ' OF ' + fromCertificate.max_qty + ' SERIAL NUMBER ' + fromCertificate.id, 325, 50);
                context.font = '12pt OCR-A';
                context.fillStyle = 'rgb(248,34,41)';
                this.wrapText(context, 'SOLD TO ' + fromCertificate.gamer_tag.toUpperCase() + ' FOR UNLIMITED USE IN ' + fromCertificate.platform.toUpperCase(), 325, 75, 500, 30);
                if(fromCertificate?.test){
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
                        const tempCanvas = createCanvas(ImagesConfigs.SIZES.default, height);
                        tempCanvas.getContext("2d").drawImage(canvas, 0, 0);
                        canvas.width *= scale;
                        canvas.height *= scale;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(tempCanvas, 0, 0, ImagesConfigs.SIZES.default, height, 0, 0, ImagesConfigs.SIZES.default * scale, height * scale);
                        logger.info("Scaled to " + scale);
                    } catch (error) {
                        logger.info(error);
                        reject(error);
                    }
                };

                accept(canvas.toBuffer());
            });
        });
    }
}
