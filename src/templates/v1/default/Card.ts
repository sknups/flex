import { BrandTemplate } from "../../BrandTemplate";
import { ImagesConfigs } from "../../../images/images.configs";
import { Canvas, createCanvas } from "canvas";
import { logger } from '../../../logger'
import { ItemDTO } from "../../../entities/services/entities.service";

// noinspection JSUnusedGlobalSymbols
export class DefaultTemplate extends BrandTemplate<ItemDTO> {

    async renderTemplate(dto: ItemDTO, purpose: string): Promise<Canvas> {
        logger.debug(`Drawing card ${dto.thumbprint} purpose ${purpose}`);
        const height = 1350;
        this.loadDefaultFontsIntoCanvas();
        let canvas = createCanvas(900, height);

        const context = canvas.getContext('2d');
        context.patternQuality = 'good';
        context.quality = 'good';

        let images = await this.loadImages([
            `sku.${dto.certVersion}.cardFront.${dto.stockKeepingUnitCode}.png`
        ]);

        const skuImage = images[0];
        if (skuImage.status == 'fulfilled') {
            const imageDimensions = this.scaleToMax(900, 1350, skuImage.value);
            context.drawImage(skuImage.value, 0, 0, imageDimensions[0], imageDimensions[1]);
        } else {
            logger.info('Failed to load sku image: ' + dto.stockKeepingUnitCode);
        }

        context.fillStyle = ImagesConfigs.TEXT_COLOR;
        context.font = '35pt Jost';
        context.textAlign = 'left';
        context.fillText(dto.stockKeepingUnitName, 100, 1040);

        context.font = '35pt ShareTechMono-Regular';
        const qty = this.getItemNumberText(dto.maxQty, dto.saleQty, dto.stockKeepingUnitRarity);
        context.fillText('' + qty, 100, 1100);

        this.writeTestWatermark(context);


        if (purpose == 'og') {
            canvas = this.convertToOg(canvas);
        }

        if (purpose == 'snapsticker') {
            canvas = this.convertToSnapchatSticker(canvas);
        }

        if (purpose == 'thumb') {
            canvas = this.convertToThumb(canvas);
        }

        return canvas;

    }
}
