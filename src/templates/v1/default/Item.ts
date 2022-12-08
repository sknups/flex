import {BrandTemplate} from "../../BrandTemplate";
import {Canvas, createCanvas} from "canvas";
import {CardLabelDTO, ItemDTO} from "../../../entities/services/item.service";

// noinspection JSUnusedGlobalSymbols
export class ItemTemplate extends BrandTemplate<ItemDTO> {

    private static readonly WIDTH = 900;
    private static readonly HEIGHT = 1350;

    async renderTemplate(item: ItemDTO, purpose: string, type: string): Promise<Canvas> {

        BrandTemplate.registerFonts();

        const canvas = createCanvas(ItemTemplate.WIDTH, ItemTemplate.HEIGHT);
        const context = canvas.getContext('2d');

        context.patternQuality = 'good';
        context.quality = 'good';

        const filename = type === 'card' ? `sku.${item.sku}.skn.png` : `sku.${item.sku}.info.png`;
        await this.draw(context, filename, ItemTemplate.WIDTH, ItemTemplate.HEIGHT);

        let labels : CardLabelDTO[] = []

        if (item.card !== null) {
            switch (type) {
                case 'card':
                    if (item.card.front !== null) {
                        Array.prototype.push.apply(labels, item.card.front);
                    }
                    break;
                case 'back':
                    if (item.card.back !== null) {
                        Array.prototype.push.apply(labels, item.card.back);
                    }
                    break;
            }
        }

        for (let label of labels) {

            const style  = {
                color: label.color,
                font: `${label.size} "${label.font}" ${label.weight}`,
                align: label.align,
            };

            const text = this.parseTemplateString(label.text, item);
            this.print(context, style, text, label.x, label.y);

        }

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

    parseTemplateString(template : string, data: Object) : string {
        const names = Object.keys(data);
        const values = Object.values(data);
        return new Function(...names, `return \`${template}\`;`)(...values);
    }

}
