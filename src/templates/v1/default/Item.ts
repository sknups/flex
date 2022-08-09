import {BrandTemplate} from "../../BrandTemplate";
import {Canvas, createCanvas} from "canvas";
import {CardDTO, CardLabelDTO, ItemDTO} from "../../../entities/services/entities.service";

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

        const sku = item.sku;
        
        const filename = type === 'card' ? `sku.v1.cardFront.${sku}.png` : `sku.v1.cardBack.${sku}.png`;
       
        let card : CardLabelDTO[] = []
        if (item.card !== null) {
          card = type === 'card' ? item.card.front : item.card.back
        }

        if (!card){
            card = []
        }

        await this.draw(context, filename, ItemTemplate.WIDTH, ItemTemplate.HEIGHT);

        for (let label of card) {
            const style  = {
                color: label.color,
                font: `${label.size} "${label.font}" ${label.weight}`,
                lineHeight: 0,
                maximumWidth: Infinity, // wrapping disabled
                align: label.align,
            };

            const text = this.parseTemplateString(label.text,item);

            this.print(context, style, text, label.x, label.y);
        } 

        this.writeTestWatermark(context);

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
