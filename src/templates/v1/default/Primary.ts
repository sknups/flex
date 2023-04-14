import { BrandTemplate } from "../../BrandTemplate";
import { Canvas } from "canvas";
import { ItemDTO } from "../../../entities/services/item.service";
import { ItemTemplate } from "./Item";
import { legacyItemMedia } from "../../../utils/legacy.utils";

// noinspection JSUnusedGlobalSymbols
export class DefaultTemplate extends ItemTemplate {

    async renderTemplate(item: ItemDTO, purpose: string): Promise<Canvas> {
        if (item.version === "1") {
            item.media = legacyItemMedia(item.name, item.description, item.rarity);
        }

        return await super.renderTemplate(item, purpose, 'primary');
    }

}
