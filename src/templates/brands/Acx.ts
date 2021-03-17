import {BrandTemplate} from "../BrandTemplate";
import {CertificateDTO} from "../../certificates/services/certificates.service";
import logger from "winston";
import {createCanvas} from "canvas";
import {StringUtils} from "../../utils/string.utils";
import {IFlexCoordinates} from "../../models/IFlexCoordinates";

/**
 * Dynamic imported on ImagesService.ts
 */
export class Acx extends BrandTemplate {

    static WIDTH: number = 1050;
    static HEIGHT: number = 600;

    renderTemplate(fromCertificate: CertificateDTO, use: string): Promise<Buffer> {
        logger.info(`Acx.renderTemplate for ${fromCertificate.brandCode} and will use ${use}`);

        return new Promise<Buffer>((accept, reject) => {
            //find out if we're going to scale the image
            let scale = 1;

            // Load specific fonts
            this.loadFontsIntoCanvas([
                {
                    path: './static/fonts/PermanentMarker-Regular.ttf',
                    fontFace: {family: 'Permanent Marker', style: 'Regular'}
                }
            ]);

            // Business card size in pixels
            const canvas = createCanvas(1050, 656);

            const context = canvas.getContext('2d');
            context.patternQuality = 'bilinear';
            context.quality = 'bilinear';

            this.loadImages([
                `./static/backgrounds/${StringUtils.capitalize(fromCertificate.brandCode.toLowerCase())}/vanguar_background.jpg`,
                `./static/brands/${fromCertificate.brandCode}.png`,
                `./static/sku/ACX-destiny.png`
            ]).then((imagePromisesResult) => {
                //draw the images first
                const imagesPositions: IFlexCoordinates[] = [
                    {dx: 0, dy: 0, dw: 1050, dh: 656},
                    {dx: 850, dy: 450, dw: 150, dh: 100},
                    {dx: 0, dy: 40, dw: 270, dh: 500}
                ];

                this.addImagesToCanvas(
                    context,
                    imagePromisesResult.map((result, index) => {
                        return {
                            image: result,
                            coords: imagesPositions[index]
                        }
                    })
                );

                //write the text
                context.fillStyle = 'rgb(255,255,255)';
                context.font = '10pt Permanent Marker';
                this.wrapText(context, fromCertificate.description, 325, 100, 500, 30);
                context.font = '16pt Permanent Marker';
                context.fillText('ITEM ' + fromCertificate.saleQty + ' OF ' + fromCertificate.max_qty + ' SERIAL NUMBER ' + fromCertificate.id, 325, 50);
                context.font = '12pt Permanent Marker';
                context.fillStyle = 'rgb(248,34,41)';
                this.wrapText(context, 'SOLD TO ' + fromCertificate.gamerTag.toUpperCase() + ' FOR UNLIMITED USE IN ' + fromCertificate.platformCode.toUpperCase(), 325, 75, 500, 30);
                if (fromCertificate?.test) {
                    context.fillStyle = 'rgb(118,188,127)';
                    context.font = '42pt Permanent Marker';
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
                        const tempCanvas = createCanvas(Acx.WIDTH, Acx.HEIGHT);
                        tempCanvas.getContext("2d").drawImage(canvas, 0, 0);
                        canvas.width *= scale;
                        canvas.height *= scale;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(tempCanvas, 0, 0, Acx.WIDTH, Acx.HEIGHT, 0, 0, Acx.WIDTH * scale, Acx.HEIGHT * scale);
                        logger.info("Scaled to " + scale);
                    } catch (error) {
                        logger.info(error);
                        reject(error);
                    }
                }
                ;

                accept(canvas.toBuffer());
            });
        });
    }
}
