import { BrandTemplate } from "../../BrandTemplate";
import { ImagesConfigs } from "../../../images/images.configs";
import { Canvas, createCanvas, Image, loadImage, registerFont } from "canvas";
import { logger } from '../../../logger'
import { SkuDTO } from "../../../entities/services/entities.service";
import { Context } from "node:vm";

export class DefaultTemplate extends BrandTemplate<SkuDTO> {

    async renderTemplate(sku: SkuDTO, purpose: string): Promise<Canvas> {
        //find out if we're going to scale the image
        let scale = ImagesConfigs.SIZES.SCALE;
        logger.debug(`Drawing card of SKU ${sku.code} purpose ${purpose}`);

        // Load Fonts
        this.loadDefaultFontsIntoCanvas();
        let canvas = createCanvas(900, 1350);

        const context = canvas.getContext('2d');
        context.patternQuality = 'good';
        context.quality = 'good';

        const rarity = this.getSkuRarity(sku.rarity, sku.code);

        //Load all required images in parallel before drawing them on the canvas
        let images = await this.loadImages([
            `./static/backgrounds/card.front.rarity${rarity}.v3.jpg`,
            `sku.v1.cardFront.${sku.code}.png`
        ]);

        const backgroundImage = images[0];
        if (backgroundImage.status === 'fulfilled') {
            context.drawImage(backgroundImage.value, 0, 0);
        } else {
            logger.info('Failed to load background image image:');
        }
        const skuImage = images[1];
        if (skuImage.status === 'fulfilled') {
            const imageDimensions = this.scaleToMax(900, 1350, skuImage.value);
            context.drawImage(skuImage.value, 0, 0, imageDimensions[0], imageDimensions[1]);
        } else {
            logger.info('Failed to load sku image: ' + sku.code);
        }

        //write the text
        context.fillStyle = ImagesConfigs.TEXT_COLOR;
        context.font = '35pt JostSemi';
        context.textAlign = 'left';
        context.fillText(sku.name, 100, 1040);

        this.writeTestWatermark(context);

        return canvas;
    }
}
