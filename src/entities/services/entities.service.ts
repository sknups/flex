import axios from "axios";
import {logger} from '../../logger'
import {AuthenticationUtils} from "../../utils/authentication.utils";

export interface ItemDTO {
    brandCode: string;
    certVersion: string;
    claimCode: string;
    description: string;
    flexHost: string;
    maxQty: number;
    saleQty: number;
    sknappHost: string;
    stockKeepingUnitCode: string;
    stockKeepingUnitName: string;
    stockKeepingUnitRarity: number;
    thumbprint: string;
}

export interface SkuDTO {
    code: string;
    name: string;
    rarity: number;
    brandCode: string;
    brandName: string;
}

export class EntitiesService {
    private readonly drmServerUrl: string = 'https://drm-service-dev.sknups.gg';

    constructor() {
        if (process.env.DRM_SERVER) this.drmServerUrl = [process.env.DRM_SERVER].join('/');
    }

    /**
     * Get an item from ID
     * @param id
     */
    async getItem(id: any): Promise<ItemDTO> {
        logger.debug(`EntitiesService.getItem ${id}`);
        const token = await AuthenticationUtils.getServiceBearerToken(this.drmServerUrl);
        const response = await axios.get<ItemDTO>(
            `${this.drmServerUrl}/api/v1/items/flex/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data
    }

    async getSku(id: any): Promise<SkuDTO> {
        logger.debug(`EntitiesService.getSku ${id}`);
        const token = await AuthenticationUtils.getServiceBearerToken(this.drmServerUrl);
        const response = await axios.get<SkuDTO>(
            `${this.drmServerUrl}/api/v1/skus/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data
    }

}
