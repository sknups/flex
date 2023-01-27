import {BrandTemplate} from "../../BrandTemplate";
import {Canvas, createCanvas} from "canvas";
import {LabelDTO, ItemDTO} from '../../../entities/services/item.service';

// noinspection JSUnusedGlobalSymbols
export class ItemTemplate extends BrandTemplate<ItemDTO> {

    private static readonly WIDTH = 900;
    private static readonly HEIGHT = 1350;

    async renderTemplate(item: ItemDTO, purpose: string, type: string, index?: string): Promise<Canvas> {

        BrandTemplate.registerFonts();

        const canvas = createCanvas(ItemTemplate.WIDTH, ItemTemplate.HEIGHT);
        const context = canvas.getContext('2d');

        context.patternQuality = 'good';
        context.quality = 'good';

        const filename = type === 'primary' ? `sku.${item.sku}.primary.png` : `sku.${item.sku}.secondary.${index}.png`;
        await this.draw(context, filename, ItemTemplate.WIDTH, ItemTemplate.HEIGHT);

        let labels : LabelDTO[] = []

        switch (type) {
            case 'primary':
                if (item.media?.primary?.labels) {
                    Array.prototype.push.apply(labels, item.media.primary.labels);
                }
                break;
            case 'secondary':
                if (index && item.media?.secondary && item.media.secondary.length > +index && item.media.secondary[+index].labels) {
                    Array.prototype.push.apply(labels, item.media.secondary[+index].labels);
                }
                break;
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
