import { BrandTemplate } from "../../BrandTemplate";
import { ImagesConfigs } from "../../../images/images.configs";
import { Canvas, CanvasRenderingContext2D, createCanvas, Image, loadImage, registerFont } from "canvas";
import { logger } from '../../../logger'
import { ItemDTO } from "../../../entities/services/entities.service";
import { Context } from "node:vm";

export class DefaultTemplate extends BrandTemplate<ItemDTO> {

    //If the text is wrapped, will return by how many pixels *additional* depth - 0 if on one line
    writeText(ctx: Context, title: String, body: String, lx: number, rx: number, y: number) {

        let wrap = 0;
        const space = 34;
        ctx.textAlign = 'left';
        ctx.fillStyle = ImagesConfigs.TEXT_RGB;
        ctx.font = '23.5pt Jost';
        ctx.fillText(title + ':', lx, y);
        ctx.font = '25pt ShareTechMono-Regular';
        if (body.length > 15) {
            const words = body.split(' ');
            let line = '';
            for (let n = 0; n < words.length; n++) {
                if (line.length + words[n].length > 15) {
                    ctx.fillText(line, rx, y + wrap);
                    wrap = wrap + space;
                    line = words[n] + ' ';
                } else {
                    line = line + words[n] + ' '
                }
            }
            ctx.fillText(line, rx, y + wrap);
        } else {
            ctx.fillText(body, rx, y);
        }
        return wrap;
    }

    async renderTemplate(dto: ItemDTO, purpose: string): Promise<Canvas> {

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
            `./static/backgrounds/card.back.rarity${rarity}.v3.jpg`,
            `sku.${dto.certVersion}.cardBack.${dto.stockKeepingUnitCode}.png`
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
        const skuImage = images[1];
        if (skuImage.status == 'fulfilled') {
            const imageDimensions = this.scaleToMax(900, 1350, skuImage.value);
            context.drawImage(skuImage.value, 0, 0, imageDimensions[0], imageDimensions[1]);
        } else {
            logger.info('Failed to load sku image: ' + dto.stockKeepingUnitCode);
        }

        //write the text
        let y_shift = this.writeText(context, 'ITEM', dto.stockKeepingUnitName.toLocaleUpperCase(), L_COL_L, R_COL_L, 200);
        if (dto.stockKeepingUnitRarity >= 1) {
            this.writeText(context, 'ITEM NUMBER', '' + this.getItemNumberText(dto.maxQty, dto.saleQty, dto.stockKeepingUnitRarity), L_COL_L, R_COL_L, 270 + y_shift);
        }
        this.writeText(context, 'OWNERSHIP TOKEN', dto.thumbprint, L_COL_L, R_COL_L, 340 + y_shift);

        this.writeText(context, 'DESCRIPTION', '', L_COL_L, R_COL_L, 410 + y_shift);
        context.font = '18pt Minion';
        this.wrapText(context, dto.description, R_COL_L, 410 + y_shift, 340, 35);

        this.writeTestWatermark(context);

        if (purpose == 'thumb') {
            canvas = this.convertToThumb(canvas);
        }
        return canvas;
    }
}
