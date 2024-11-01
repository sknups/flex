import { BrandTemplate } from "../../BrandTemplate";
import { ImagesConfigs } from "../../../images/images.configs";
import { Canvas, createCanvas } from "canvas";
import { SkuDTO } from "../../../entities/services/sku.service";

// noinspection JSUnusedGlobalSymbols
export class DefaultTemplate extends BrandTemplate<SkuDTO> {

    private static readonly WIDTH = 900;
    private static readonly HEIGHT = 1350;

    private static readonly TEXT_X = 100;

    private static readonly SKU_NAME_BASELINE = 1040;

    static readonly SKU_NAME_STYLE = {
        color: ImagesConfigs.TEXT_COLOR,
        font: '35pt "Jost" Semibold',
        align: 'left'
    };

    async renderTemplate(sku: SkuDTO, purpose: string): Promise<Canvas> {

        BrandTemplate.registerFonts();

        const canvas = createCanvas(DefaultTemplate.WIDTH, DefaultTemplate.HEIGHT);
        const context = canvas.getContext('2d');

        context.patternQuality = 'good';
        context.quality = 'good';

        const filename = `sku.${sku.code}.skn.png`;
        await this.draw(context, filename, DefaultTemplate.WIDTH, DefaultTemplate.HEIGHT);

        if (sku.version === "1") {
          // print SKU name (original case preserved)
          this.print(context, DefaultTemplate.SKU_NAME_STYLE, sku.name, DefaultTemplate.TEXT_X, DefaultTemplate.SKU_NAME_BASELINE);
        }

        switch (purpose) {
            case 'og':
                return this.convertToOg(canvas);
            case 'snapsticker':
                return this.convertToSnapchatSticker(canvas);
            case 'metaplex': // fall through
            default:
                return canvas;
        }

    }
}
