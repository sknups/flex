import { BrandTemplate } from "../../BrandTemplate";
import { ImagesConfigs } from "../../../images/images.configs";
import { Canvas, createCanvas } from "canvas";
import { SkuDTO } from "../../../entities/services/entities.service";

// noinspection JSUnusedGlobalSymbols
export class DefaultTemplate extends BrandTemplate<SkuDTO> {

    private static readonly WIDTH = 900;
    private static readonly HEIGHT = 1350;

    private static readonly TEXT_X = 100;

    private static readonly SKU_NAME_BASELINE = 1040;

    static readonly SKU_NAME_STYLE = {
        color: ImagesConfigs.TEXT_COLOR,
        font: '35pt Jost Semibold',
        lineHeight: 0,
        maximumWidth: Infinity, // wrapping disabled
    };

    async renderTemplate(sku: SkuDTO, _ignored: string): Promise<Canvas> {

        BrandTemplate.registerFonts();

        const canvas = createCanvas(DefaultTemplate.WIDTH, DefaultTemplate.HEIGHT);
        const context = canvas.getContext('2d');

        context.patternQuality = 'good';
        context.quality = 'good';

        const filename = `sku.v1.cardFront.${sku.code}.png`;
        await this.draw(context, filename, DefaultTemplate.WIDTH, DefaultTemplate.HEIGHT);

        // print SKU name (original case preserved)
        this.print(context, DefaultTemplate.SKU_NAME_STYLE, sku.name, DefaultTemplate.TEXT_X, DefaultTemplate.SKU_NAME_BASELINE);

        this.writeTestWatermark(context);

        return canvas;

    }
}
