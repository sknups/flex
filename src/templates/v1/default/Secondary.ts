import {BrandTemplate} from "../../BrandTemplate";
import {ImagesConfigs} from "../../../images/images.configs";
import {Canvas, createCanvas} from "canvas";
import {ItemDTO} from "../../../entities/services/item.service";
import { ItemTemplate } from "./Item";

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
        align: 'left',
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
        align: 'left',
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
        align: 'left',
    }

    async renderTemplate(item: ItemDTO, purpose: string, index?: string): Promise<Canvas> {
        if (item.version === "1") {
            return this._renderTemplateV1(item, purpose);
        }

        return await new ItemTemplate(this.imagesService).renderTemplate(item, purpose, 'secondary', index);
    }

    private async _renderTemplateV1(dto: ItemDTO, purpose: string): Promise<Canvas> {

        BrandTemplate.registerFonts();

        const canvas = createCanvas(DefaultTemplate.WIDTH, DefaultTemplate.HEIGHT);
        const context = canvas.getContext('2d');

        context.patternQuality = 'good';
        context.quality = 'good';

        const token = dto.token;
        const code = dto.sku;
        const name = dto.name;
        const description = dto.description;
        const issue = dto.issue;
        const maximum = dto.maximum;
        const rarity = dto.rarity;

        const filename = `sku.${code}.info.png`;
        await this.draw(context, filename, DefaultTemplate.WIDTH, DefaultTemplate.HEIGHT);

        let y = DefaultTemplate.FIRST_BASELINE;

        // print SKU name (upper case)
        this.print(context, DefaultTemplate.LABEL_STYLE, 'ITEM:', DefaultTemplate.LABEL_X, y);
        y += this.wrap(context, DefaultTemplate.VALUE_STYLE, name.toLocaleUpperCase(), DefaultTemplate.VALUE_X, y);

        // print enumeration
        if (rarity != null && rarity >= 1) {
            y += 70;
            this.print(context, DefaultTemplate.LABEL_STYLE, 'ITEM NUMBER:', DefaultTemplate.LABEL_X, y);
            y += this.wrap(context, DefaultTemplate.VALUE_STYLE, this.enumeration(issue, maximum, rarity), DefaultTemplate.VALUE_X, y);
        }

        // print ownership token
        y += 70;
        this.print(context, DefaultTemplate.LABEL_STYLE, 'OWNERSHIP TOKEN:', DefaultTemplate.LABEL_X, y);
        y += this.wrap(context, DefaultTemplate.VALUE_STYLE, token, DefaultTemplate.VALUE_X, y);

        // print description
        y += 70;
        this.print(context, DefaultTemplate.LABEL_STYLE, 'DESCRIPTION:', DefaultTemplate.LABEL_X, y);
        this.wrap(context, DefaultTemplate.DESCRIPTION_STYLE, description, DefaultTemplate.VALUE_X, y);

        switch (purpose) {
            case 'thumb':
                return this.convertToThumb(canvas);
            default:
                return canvas;
        }

    }
}
