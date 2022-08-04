import axios from "axios";
import {logger} from '../../logger'
import {AuthenticationUtils} from "../../utils/authentication.utils";

export interface ItemDTO {
    token: string,
    brand: string,
    card: CardDTO | null,
    giveaway: string,
    description: string,
    flexHost: string,
    maximum: number,
    issue: number,
    sknappHost: string,
    sku: string,
    name: string,
    rarity: number | null,
    version: string,
}

export interface CardDTO {
    front: CardLabelDTO[];
    back: CardLabelDTO[];
}

export interface CardLabelDTO {
    text: string;
    color: string;
    size: string;
    font: string;
    weight: string;
    align: string;
    x: number;
    y: number;
}

export interface SkuDTO {
    code: string;
    name: string;
    version: string;
}

export class EntitiesService {
    private readonly getSKUCloudFunctionURL: string = 'https://europe-west1-drm-apps-01-43b0.cloudfunctions.net/get-sku';
    private readonly getFlexItemCloudFunctionURL: string = 'https://europe-west1-drm-apps-01-43b0.cloudfunctions.net/get-flex-item';

    constructor() {
        if (process.env.GET_FLEX_ITEM_CLOUD_FUNCTION) this.getFlexItemCloudFunctionURL = process.env.GET_FLEX_ITEM_CLOUD_FUNCTION;
        if (process.env.GET_SKU_CLOUD_FUNCTION) this.getSKUCloudFunctionURL = process.env.GET_SKU_CLOUD_FUNCTION;
    }

    /**
     * Get an item from ID
     * @param id
     */
    async getItem(id: any): Promise<ItemDTO> {
        logger.debug(`EntitiesService.getItem ${id}`);
        const token = await AuthenticationUtils.getServiceBearerToken(this.getFlexItemCloudFunctionURL);
        const response = await axios.get<ItemDTO>(
            `${this.getFlexItemCloudFunctionURL}/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data
    }

    async getSku(id: any): Promise<SkuDTO> {
        logger.debug(`EntitiesService.getSku ${id}`);
        const token = await AuthenticationUtils.getServiceBearerToken(this.getSKUCloudFunctionURL);
        const response = await axios.get<SkuDTO>(
            `${this.getSKUCloudFunctionURL}/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data
    }

}
