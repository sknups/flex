import { BrandTemplate } from "../../BrandTemplate";
import { ImagesConfigs } from "../../../images/images.configs";
import { Canvas, createCanvas } from "canvas";
import { logger } from '../../../logger'
import { SkuDTO } from "../../../entities/services/entities.service";

// noinspection JSUnusedGlobalSymbols
export class DefaultTemplate extends BrandTemplate<SkuDTO> {

    async renderTemplate(sku: SkuDTO, purpose: string): Promise<Canvas> {
        logger.debug(`Drawing card of SKU ${sku.code} purpose ${purpose}`);

        this.loadDefaultFontsIntoCanvas();
        let canvas = createCanvas(900, 1350);

        const context = canvas.getContext('2d');
        context.patternQuality = 'good';
        context.quality = 'good';

        let images = await this.loadImages([
            `sku.v1.cardFront.${sku.code}.png`
        ]);

        const skuImage = images[0];
        if (skuImage.status === 'fulfilled') {
            const imageDimensions = this.scaleToMax(900, 1350, skuImage.value);
            context.drawImage(skuImage.value, 0, 0, imageDimensions[0], imageDimensions[1]);
        } else {
            logger.info('Failed to load sku image: ' + sku.code);
        }

        context.fillStyle = ImagesConfigs.TEXT_COLOR;
        context.font = '35pt JostSemi';
        context.textAlign = 'left';
        context.fillText(sku.name, 100, 1040);

        this.writeTestWatermark(context);

        return canvas;
    }
}
