import {BrandTemplate} from "../../BrandTemplate";
import {ImagesConfigs} from "../../../images/images.configs";
import {Canvas, createCanvas} from "canvas";
import {ItemDTO} from "../../../entities/services/entities.service";

// noinspection JSUnusedGlobalSymbols
export class DefaultTemplate extends BrandTemplate<ItemDTO> {

    private static readonly WIDTH = 900;
    private static readonly HEIGHT = 1350;

    private static readonly LABEL_X = 130;
    private static readonly VALUE_X = 470;

    private static readonly FIRST_BASELINE = 200;

    static readonly LABEL_STYLE = {
        color: ImagesConfigs.TEXT_COLOR,
        font: '23.5pt "Jost" Regular',
        lineHeight: 0,
        maximumWidth: Infinity, // wrapping disabled
    };

    static readonly VALUE_STYLE = {
        color: ImagesConfigs.TEXT_COLOR,
        font: '25pt "Share Tech Mono" Regular',
        lineHeight: 34,
        /**
         * The maximum width of each line of a monospaced value, e.g. SKU Name.
         * BEWARE! This width assumes a trailing space character.
         *
         * This value is sixteen characters of 25pt Share Tech Mono.
         * If this needed reducing to fifteen characters, the value should be 270px.
         */
        maximumWidth: 288, // pixels
    };

    static readonly DESCRIPTION_STYLE = {
        color: ImagesConfigs.TEXT_COLOR,
        font: '18pt "Crimson Text" Regular',
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

        const token = dto.thumbprint;
        const code = dto.stockKeepingUnitCode;
        const name = dto.stockKeepingUnitName;
        const description = dto.description;
        const issue = dto.saleQty;
        const maximum = dto.maxQty;
        const rarity = dto.stockKeepingUnitRarity;

        const filename = `sku.v1.cardBack.${code}.png`;
        await this.draw(context, filename, DefaultTemplate.WIDTH, DefaultTemplate.HEIGHT);

        // print SKU name (upper case)
        let y = DefaultTemplate.FIRST_BASELINE;
        y += this.print(context, DefaultTemplate.LABEL_STYLE, 'ITEM:', DefaultTemplate.LABEL_X, y);
        y += this.print(context, DefaultTemplate.VALUE_STYLE, name.toLocaleUpperCase(), DefaultTemplate.VALUE_X, y);

        // print enumeration
        if (rarity >= 1) {
            y += 70;
            y += this.print(context, DefaultTemplate.LABEL_STYLE, 'ITEM NUMBER:', DefaultTemplate.LABEL_X, y);
            y += this.print(context, DefaultTemplate.VALUE_STYLE, this.enumeration(issue, maximum, rarity), DefaultTemplate.VALUE_X, y);
        }

        // print ownership token
        y += 70;
        y += this.print(context, DefaultTemplate.LABEL_STYLE, 'OWNERSHIP TOKEN:', DefaultTemplate.LABEL_X, y);
        y += this.print(context, DefaultTemplate.VALUE_STYLE, token, DefaultTemplate.VALUE_X, y);

        // print description
        y += 70;
        y += this.print(context, DefaultTemplate.LABEL_STYLE, 'DESCRIPTION:', DefaultTemplate.LABEL_X, y);
        y += this.print(context, DefaultTemplate.DESCRIPTION_STYLE, description, DefaultTemplate.VALUE_X, y);

        this.writeTestWatermark(context);

        switch (purpose) {
            case 'thumb':
                return this.convertToThumb(canvas);
            default:
                return canvas;
        }

    }

}
