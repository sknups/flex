import {BrandTemplate} from "../../BrandTemplate";
import {ImagesConfigs} from "../../../images/images.configs";
import {Canvas, createCanvas} from "canvas";
import {logger} from '../../../logger'
import {ItemDTO} from "../../../entities/services/entities.service";
import {Context} from "node:vm";

// noinspection JSUnusedGlobalSymbols
export class DefaultTemplate extends BrandTemplate<ItemDTO> {

    /**
     * @returns {number} additional vertical pixels consumed due to multiline
     */
    writeText(context: Context, key: String, value: String, key_x: number, value_x: number, y: number) {

        const LINE_HEIGHT = 34; // pixels
        const KEY_FONT = '23.5pt Jost';
        const VALUE_FONT = '25pt ShareTechMono-Regular';

        context.textAlign = 'left';
        context.fillStyle = ImagesConfigs.TEXT_COLOR;

        context.font = KEY_FONT;
        context.fillText(key + ':', key_x, y);

        context.font = VALUE_FONT;

        // short-circuit
        if (value.length <= 15) {
            context.fillText(value, value_x, y);
            return 0;
        }

        let buffer = '';
        let first = true;

        let lineNumber = 0;

        for (const word of value.split(' ')) {

            const proposed = buffer + word + ' ';
            const width = proposed.length; // monospaced characters

            if (width > 16 && !first) {
                // buffer would overflow
                // print buffer contents
                context.fillText(buffer, value_x, y + (lineNumber * LINE_HEIGHT));
                // carriage return
                lineNumber += 1;
                buffer = word + ' ';
            } else {
                // buffer would not overflow
                // (or it's the very first word)
                buffer = proposed;
            }

            first = false;

        }

        context.fillText(buffer, value_x, y + (lineNumber * LINE_HEIGHT));
        return (lineNumber * LINE_HEIGHT);

    }

    public wrapText(context: CanvasRenderingContext2D, input: string, x: number, y: number, maxWidth: number, lineHeight: number) {

        let buffer = '';
        let first = true;

        let lineNumber = 0;

        for (const word of input.split(' ')) {

            const proposed = buffer + word + ' ';
            const width = context.measureText(proposed).width; // pixels

            if (width > maxWidth && !first) {
                // buffer would overflow
                // print buffer contents
                context.fillText(buffer, x, y + (lineNumber * lineHeight));
                // carriage return
                lineNumber += 1;
                buffer = word + ' ';
            } else {
                // buffer would not overflow
                // (or it's the very first word)
                buffer = proposed;
            }

            first = false;

        }

        context.fillText(buffer, x, y + (lineNumber * lineHeight));
    }

    async renderTemplate(dto: ItemDTO, purpose: string): Promise<Canvas> {

        BrandTemplate.registerFonts();

        const height = 1350;
        let canvas = createCanvas(900, height);

        const context = canvas.getContext('2d');
        context.patternQuality = 'good';
        context.quality = 'good';

        let images = await this.loadImages([
            `sku.${dto.certVersion}.cardBack.${dto.stockKeepingUnitCode}.png`
        ]);
        const L_COL_L = 130;
        const R_COL_L = 470;

        const skuImage = images[0];
        if (skuImage.status == 'fulfilled') {
            const imageDimensions = this.scaleToMax(900, 1350, skuImage.value);
            context.drawImage(skuImage.value, 0, 0, imageDimensions[0], imageDimensions[1]);
        } else {
            logger.info('Failed to load sku image: ' + dto.stockKeepingUnitCode);
        }

        let y_shift = this.writeText(context, 'ITEM', dto.stockKeepingUnitName.toLocaleUpperCase(), L_COL_L, R_COL_L, 200);
        if (dto.stockKeepingUnitRarity >= 1) {
            // there's an assumption that this call returns zero
            // meaning this call only writes a single row of text
            // which will be true if getItemNumberText returns ≤ 15 characters
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
