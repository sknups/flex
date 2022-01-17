import { BrandTemplate } from "../../BrandTemplate";
import { ImagesConfigs } from "../../../images/images.configs";
import { Canvas, createCanvas, Image, loadImage, registerFont } from "canvas";
import { logger } from '../../../logger'
import { ItemDTO } from "../../../entities/services/entities.service";
import { Context } from "node:vm";

export class DefaultTemplate extends BrandTemplate<ItemDTO> {

    async renderTemplate(dto: ItemDTO, purpose: string): Promise<Canvas> {
        //find out if we're going to scale the image
        let scale = ImagesConfigs.SIZES.SCALE;
        logger.debug(`Drawing card ${dto.thumbprint} purpose ${purpose}`);
        const height = 1350;
        // Load Fonts
        this.loadDefaultFontsIntoCanvas();
        let canvas = createCanvas(900, height);

        const context = canvas.getContext('2d');
        context.patternQuality = 'good';
        context.quality = 'good';

        const rarity = this.getRarity(dto);

        //Load all required images in parallel before drawing them on the canvas
        let images = await this.loadImages([
            `./static/backgrounds/card.front.rarity${rarity}.v3.jpg`,            
            `sku.${dto.certVersion}.cardFront.${dto.stockKeepingUnitCode}.png`
        ]);
        //.then((images) => {
        //draw the images first
        const backgroundImage = images[0];
        if (backgroundImage.status == 'fulfilled') {
            context.drawImage(backgroundImage.value, 0, 0);
        } else {
            logger.info('Failed to load background image image:');
        }
        const skuImage = images[1];
        if (skuImage.status == 'fulfilled') {
            const imageDimensions = this.scaleToMax(900, 1350, skuImage.value);
            context.drawImage(skuImage.value, 0, 0, imageDimensions[0], imageDimensions[1]);
        } else {
            logger.info('Failed to load sku image: ' + dto.stockKeepingUnitCode);
        }
  
        //write the text
        context.fillStyle = ImagesConfigs.TEXT_RGB;
        context.font = '35pt Jost';
        context.textAlign = 'left';
        context.fillText(dto.stockKeepingUnitName, 100, 1040);

        context.font = '35pt ShareTechMono-Regular';
        var qty = this.getItemNumberText(dto.maxQty, dto.saleQty, dto.stockKeepingUnitRarity);
        context.fillText('' + qty, 100, 1100);

        this.writeTestWatermark(context);
   

        if (purpose == 'og') {
            canvas = this.convertToOg(canvas);
        }

        if (purpose == 'thumb') {
            canvas = this.convertToThumb(canvas);
        }

        return canvas;

        //}).catch((err)=>{
        //    logger.error(`Failed to create canvas: ${err}`);
        //});
        //return canvas;
    }
}
