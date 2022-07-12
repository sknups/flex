import {BrandTemplate} from "../../BrandTemplate";
import {ImagesConfigs} from "../../../images/images.configs";
import {Canvas, createCanvas, NodeCanvasRenderingContext2D} from "canvas";
import {logger} from '../../../logger'
import {ItemDTO} from "../../../entities/services/entities.service";

/**
 * How text should be printed.
 */
export interface Style {
    color: string,
    font: string,
    lineHeight: number,
    maximumWidth: number,
}

// noinspection JSUnusedGlobalSymbols
export class DefaultTemplate extends BrandTemplate<ItemDTO> {

    private static readonly WIDTH = 900;
    private static readonly HEIGHT = 1350;

    private static readonly LABEL_X = 130;
    private static readonly VALUE_X = 470;
    private static readonly FIRST_BASELINE = 200;

    static readonly LABEL_STYLE = {
        color: ImagesConfigs.TEXT_COLOR,
        font: '23.5pt Jost',
        lineHeight: 34,
        maximumWidth: Infinity, // wrapping disabled
    };

    static readonly VALUE_STYLE = {
        color: ImagesConfigs.TEXT_COLOR,
        font: '25pt ShareTechMono-Regular',
        lineHeight: 34,
        /**
         * The maximum width of each line of a monospaced value, e.g. SKU Name.
         * BEWARE! This width assumes a trailing space character.
         *
         * This value is sixteen characters of 25pt ShareTechMono-Regular.
         * If this needed reducing to fifteen characters, the value should be 270px.
         */
        maximumWidth: 288, // pixels
    };

    static readonly DESCRIPTION_STYLE = {
        color: ImagesConfigs.TEXT_COLOR,
        font: '18pt Minion',
        lineHeight: 35,
        /**
         * The maximum width of each line of a SKU description.
         * BEWARE! This width assumes a trailing space character.
         */
        maximumWidth: 340, // pixels
    }


    async renderTemplate(dto: ItemDTO, purpose: string): Promise<Canvas> {

        BrandTemplate.registerFonts();

        const canvas = createCanvas(DefaultTemplate.WIDTH, DefaultTemplate.HEIGHT);
        const context = canvas.getContext('2d');

        context.patternQuality = 'good';
        context.quality = 'good';

        await this.drawCardBackImage(dto, context);

        let y = DefaultTemplate.FIRST_BASELINE;
        y += this.print(context, DefaultTemplate.LABEL_STYLE, 'ITEM:', DefaultTemplate.LABEL_X, y);
        y += this.print(context, DefaultTemplate.VALUE_STYLE, dto.stockKeepingUnitName.toLocaleUpperCase(), DefaultTemplate.VALUE_X, y);

        if (dto.stockKeepingUnitRarity >= 1) {
            y += 70;
            y += this.print(context, DefaultTemplate.LABEL_STYLE, 'ITEM NUMBER:', DefaultTemplate.LABEL_X, y);
            y += this.print(context, DefaultTemplate.VALUE_STYLE, this.getItemNumberText(dto.maxQty, dto.saleQty, dto.stockKeepingUnitRarity), DefaultTemplate.VALUE_X, y);
        }

        y += 70;
        y += this.print(context, DefaultTemplate.LABEL_STYLE, 'OWNERSHIP TOKEN:', DefaultTemplate.LABEL_X, y);
        y += this.print(context, DefaultTemplate.VALUE_STYLE, dto.thumbprint, DefaultTemplate.VALUE_X, y);

        y += 70;
        y += this.print(context, DefaultTemplate.LABEL_STYLE, 'DESCRIPTION:', DefaultTemplate.LABEL_X, y);
        y += this.print(context, DefaultTemplate.DESCRIPTION_STYLE, dto.description, DefaultTemplate.VALUE_X, y);

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

    // BEWARE
    // This method prints a trailing whitespace character on each line.
    // This is visually benign, but it means that width calculations are incorrect.
    // There is almost no incentive to fix this, as word wrap calculations only affect Legacy SKU.

    print(context: NodeCanvasRenderingContext2D, style: Style, text: string, x: number, y: number): number {

        context.textAlign = 'left';
        context.font = style.font;
        context.fillStyle = style.color;

        let buffer = '';
        let first = true;

        let lineNumber = 0;

        for (const word of text.split(' ')) {

            const proposed = buffer + word + ' ';
            const width = context.measureText(proposed).width; // pixels

            if (width > style.maximumWidth && !first) {
                // buffer would overflow
                // print buffer contents
                context.fillText(buffer, x, y + (lineNumber * style.lineHeight));
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

        context.fillText(buffer, x, y + (lineNumber * style.lineHeight));
        return (lineNumber * style.lineHeight);
    }

}
