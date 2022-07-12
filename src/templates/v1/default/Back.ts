import {BrandTemplate} from "../../BrandTemplate";
import {ImagesConfigs} from "../../../images/images.configs";
import {Canvas, createCanvas, NodeCanvasRenderingContext2D} from "canvas";
import {logger} from '../../../logger'
import {ItemDTO} from "../../../entities/services/entities.service";
import {Context} from "node:vm";

// noinspection JSUnusedGlobalSymbols
export class DefaultTemplate extends BrandTemplate<ItemDTO> {

    /**
     * @returns {number} additional vertical pixels consumed due to multiline
     */
    writeText(context: Context, key: String, value: String, label_x: number, value_x: number, y: number) {

        context.textAlign = 'left';
        context.fillStyle = ImagesConfigs.TEXT_COLOR;

        context.font = DefaultTemplate.LABEL_FONT;
        context.fillText(key + ':', label_x, y);

        context.font = DefaultTemplate.VALUE_FONT;

        let buffer = '';
        let first = true;

        let lineNumber = 0;

        for (const word of value.split(' ')) {

            const proposed = buffer + word + ' ';
            const width = proposed.length; // monospaced characters

            if (width > 16 && !first) {
                // buffer would overflow
                // print buffer contents
                context.fillText(buffer, value_x, y + (lineNumber * DefaultTemplate.LINE_HEIGHT));
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

        context.fillText(buffer, value_x, y + (lineNumber * DefaultTemplate.LINE_HEIGHT));
        return (lineNumber * DefaultTemplate.LINE_HEIGHT);

    }

    public wrapText(context: NodeCanvasRenderingContext2D, input: string, x: number, y: number, maxWidth: number, lineHeight: number) {

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

    private static readonly WIDTH = 900;
    private static readonly HEIGHT = 1350;

    private static readonly LINE_HEIGHT = 34; // pixels

    private static readonly LABEL_X = 130;
    private static readonly LABEL_FONT = '23.5pt Jost';

    private static readonly VALUE_X = 470;
    private static readonly VALUE_FONT = '25pt ShareTechMono-Regular';

    async renderTemplate(dto: ItemDTO, purpose: string): Promise<Canvas> {

        BrandTemplate.registerFonts();

        const canvas = createCanvas(DefaultTemplate.WIDTH, DefaultTemplate.HEIGHT);
        const context = canvas.getContext('2d');

        context.patternQuality = 'good';
        context.quality = 'good';

        await this.drawCardBackImage(dto, context);

        let y_shift = this.writeText(context, 'ITEM', dto.stockKeepingUnitName.toLocaleUpperCase(), DefaultTemplate.LABEL_X, DefaultTemplate.VALUE_X, 200);
        if (dto.stockKeepingUnitRarity >= 1) {
            // there's an assumption that this call returns zero
            // meaning this call only writes a single row of text
            // which will be true if getItemNumberText returns ≤ 15 characters
            this.writeText(context, 'ITEM NUMBER', '' + this.getItemNumberText(dto.maxQty, dto.saleQty, dto.stockKeepingUnitRarity), DefaultTemplate.LABEL_X, DefaultTemplate.VALUE_X, 270 + y_shift);
        }
        this.writeText(context, 'OWNERSHIP TOKEN', dto.thumbprint, DefaultTemplate.LABEL_X, DefaultTemplate.VALUE_X, 340 + y_shift);

        this.writeText(context, 'DESCRIPTION', '', DefaultTemplate.LABEL_X, DefaultTemplate.VALUE_X, 410 + y_shift);
        context.font = '18pt Minion';
        this.wrapText(context, dto.description, DefaultTemplate.VALUE_X, 410 + y_shift, 340, 35);

        this.writeTestWatermark(context);

        if (purpose === 'thumb') {
            return this.convertToThumb(canvas);
        } else {
            return canvas;
        }

    }

    private async drawCardBackImage(dto: ItemDTO, context: NodeCanvasRenderingContext2D) {

        const filename = `sku.${dto.certVersion}.cardBack.${dto.stockKeepingUnitCode}.png`;

        const image = (await this.loadImages([filename]))[0];

        if (image.status === 'fulfilled') {
            const dimensions = this.scaleToMax(DefaultTemplate.WIDTH, DefaultTemplate.HEIGHT, image.value);
            context.drawImage(image.value, 0, 0, dimensions[0], dimensions[1]);
        } else {
            logger.error(`Failed to load ${filename}`);
        }

    }

}
