import axios from "axios";
import {logger} from '../../logger'
import {AuthenticationUtils} from "../../utils/authentication.utils";

export interface ItemDTO {
    brandCode: string;
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
    version: string;
}

export class EntitiesService {
    private readonly drmServerUrl: string = 'https://drm-service-dev.sknups.gg';
    private readonly getSKUCloudFunctionURL: string = 'https://europe-west1-drm-apps-01-43b0.cloudfunctions.net/get-sku';

    constructor() {
        if (process.env.DRM_SERVER) this.drmServerUrl = process.env.DRM_SERVER;
        if (process.env.GET_SKU_CLOUD_FUNCTION) this.getSKUCloudFunctionURL = process.env.GET_SKU_CLOUD_FUNCTION;
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
            `${this.getSKUCloudFunctionURL}/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data
    }
    
}
