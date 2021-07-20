import { BrandTemplate } from "../../BrandTemplate";
import { ImagesConfigs } from "../../../images/images.configs";
import { Canvas, CanvasRenderingContext2D, createCanvas, Image, loadImage, registerFont } from "canvas";
import { logger } from '../../../logger'
import { CertificateDTO } from "../../../certificates/services/certificates.service";
import { Context } from "node:vm";

export class DefaultTemplate extends BrandTemplate {

    //If the text is wrapped, will return by how many pixels *additional* depth - 0 if on one line
    writeText(ctx: Context, title: String, body: String, lx: number, rx: number, y: number) {

        let wrap = 0;
        const space = 32;
        ctx.textAlign = 'left';
        ctx.fillStyle = ImagesConfigs.TEXT_RGB;
        ctx.font = '23.5pt Jost';
        ctx.fillText(title.toUpperCase() + ':', lx, y);
        ctx.font = '25pt OCR-A';
        if (body.length > 15) {
            const words = body.split(' ');
            let line = '';
            for (let n = 0; n < words.length; n++) {
                if (line.length + words[n].length > 15) {
                    ctx.fillText(line.toUpperCase(), rx, y + wrap);
                    wrap = wrap + space;
                    line = words[n] + ' ';
                } else {
                    line = line + words[n] + ' '
                }
            }
            ctx.fillText(line.toUpperCase(), rx, y + wrap);
        } else {
            ctx.fillText(body.toUpperCase(), rx, y);
        }
        return wrap;
    }

    async renderTemplate(fromCertificate: CertificateDTO, purpose: string): Promise<Canvas> {

        const height = 1350;
        // Load Fonts
        this.loadDefaultFontsIntoCanvas();
        let canvas = createCanvas(900, height);

        const context = canvas.getContext('2d');
        context.patternQuality = 'good';
        context.quality = 'good';

        //Load all required images in parallel before drawing them on the canvas
        let images = await this.loadImages([
            './static/backgrounds/card.back.default.v3.jpg',
            `brand.v2.default.${fromCertificate.brandCode}.png`,
            `sku.v1.default.${fromCertificate.stockKeepingUnitCode}.png`,
            './static/backgrounds/card.back.glass.v2.png',
        ]);
        const L_COL_L = 130;
        const L_COL_C = L_COL_L + 305 / 2;
        const R_COL_L = 470;
        //draw the images first
        const backgroundImage = images[0];
        if (backgroundImage.status == 'fulfilled') {
            context.drawImage(backgroundImage.value, 0, 0);
        } else {
            logger.info('Failed to load background image image:');
        }
        const skuImage = images[2];
        if (skuImage.status == 'fulfilled') {
            const imageDimensions = this.scaleToMax(265, 292, skuImage.value);
            context.drawImage(skuImage.value, L_COL_C - imageDimensions[0] / 2, 1050 - imageDimensions[1] / 2, imageDimensions[0], imageDimensions[1]);
        } else {
            logger.info('Failed to load sku image: ' + fromCertificate.stockKeepingUnitCode);
        }
        const brandImage = images[1];
        if (brandImage.status == 'fulfilled') {
            const imageDimensions = this.scaleToMax(265, 225, brandImage.value);
            context.drawImage(brandImage.value, L_COL_C - imageDimensions[0] / 2, 800 - imageDimensions[1] / 2, imageDimensions[0], imageDimensions[1]);
        } else {
            logger.info('Failed to load brand image: ' + fromCertificate.brandCode);
        }
        //write the text
        let y_shift = this.writeText(context, 'Item', fromCertificate.stockKeepingUnitName, L_COL_L, R_COL_L, 200);
        const tag = (fromCertificate.displayName.length > 15) ? fromCertificate.displayName.slice(0, 14) + "." : fromCertificate.displayName; this.writeText(context, 'Owner', tag, L_COL_L, R_COL_L, 270 + y_shift);
        this.writeText(context, 'Item number', this.getItemNumberText(fromCertificate.maxQty, fromCertificate.saleQty), L_COL_L, R_COL_L, 340 + y_shift);
        this.writeText(context, 'Ownership token', fromCertificate.thumbprint, L_COL_L, R_COL_L, 410 + y_shift);
        this.writeText(context, 'For use in', fromCertificate.platformName, L_COL_L, R_COL_L, 480 + y_shift);

        this.writeText(context, 'Description', '', L_COL_L, R_COL_L, 550 + y_shift);
        context.font = '18pt Minion';
        this.wrapText(context, fromCertificate.description, R_COL_L, 550 + y_shift, 340, 45);

        this.writeTestWatermark(context);

        const glassImage = images[3];
        if (glassImage.status == 'fulfilled') {
            context.drawImage(glassImage.value, 0, 0);
        } else {
            logger.info('Failed to load glass image:');
        }

        if (purpose == 'thumb') {
            canvas = this.convertToThumb(canvas);
        }
        return canvas;
    }
}