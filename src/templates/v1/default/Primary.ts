import {BrandTemplate} from "../../BrandTemplate";
import {ImagesConfigs} from "../../../images/images.configs";
import {Canvas, createCanvas} from "canvas";
import {ItemDTO} from "../../../entities/services/item.service";
import { ItemTemplate } from "./Item";

// noinspection JSUnusedGlobalSymbols
export class DefaultTemplate extends BrandTemplate<ItemDTO> {

    private static readonly WIDTH = 900;
    private static readonly HEIGHT = 1350;

    private static readonly TEXT_X = 100;

    private static readonly SKU_NAME_BASELINE = 1040;
    private static readonly ENUMERATION_BASELINE = 1100;

    static readonly SKU_NAME_STYLE = {
        color: ImagesConfigs.TEXT_COLOR,
        font: '35pt "Jost" Regular',
        align: 'left'
    };

    static readonly ENUMERATION_STYLE = {
        color: ImagesConfigs.TEXT_COLOR,
        font: '35pt "Share Tech Mono" Regular',
        align: 'left'
    };

    async renderTemplate(item: ItemDTO, purpose: string): Promise<Canvas> {
        if (item.version === "1") {
            return this._renderTemplateV1(item, purpose);
        }

        return await new ItemTemplate(this.imagesService).renderTemplate(item, purpose, 'primary');
    }

    private async _renderTemplateV1(dto: ItemDTO, purpose: string): Promise<Canvas> {

        BrandTemplate.registerFonts();

        const canvas = createCanvas(DefaultTemplate.WIDTH, DefaultTemplate.HEIGHT);
        const context = canvas.getContext('2d');

        context.patternQuality = 'good';
        context.quality = 'good';

        const name = dto.name;
        const issue = dto.issue;
        const maximum = dto.maximum;
        const rarity = dto.rarity;

        const filename = `sku.${dto.sku}.skn.png`;
        await this.draw(context, filename, DefaultTemplate.WIDTH, DefaultTemplate.HEIGHT);

        // print SKU name (original case preserved)
        this.print(context, DefaultTemplate.SKU_NAME_STYLE, name, DefaultTemplate.TEXT_X, DefaultTemplate.SKU_NAME_BASELINE);

        // print enumeration
        this.print(context, DefaultTemplate.ENUMERATION_STYLE, this.enumeration(issue, maximum, rarity), DefaultTemplate.TEXT_X, DefaultTemplate.ENUMERATION_BASELINE);

        switch (purpose) {
            case 'og':
                return this.convertToOg(canvas);
            case 'snapsticker':
                return this.convertToSnapchatSticker(canvas);
            case 'thumb':
                return this.convertToThumb(canvas);
            default:
                return canvas;
        }

    }
}
