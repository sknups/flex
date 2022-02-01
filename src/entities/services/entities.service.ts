import axios, { AxiosResponse} from "axios";
import {logger } from '../../logger'
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
     * @param withId
     */
    async getItem(withId: any): Promise<AxiosResponse<ItemDTO>> {
        const url = `${this.drmServerUrl}/api/v1/items/flex/${withId}`;
        logger.debug(`EntitiesService.getItem withId:${withId} from ${url}`);
        const bearerToken = await AuthenticationUtils.getServiceBearerToken(url);

        const drmOptions = {
            headers: {
                Authorization: `Bearer ${bearerToken}`,
            }
        };
        return axios.get<ItemDTO>(url, drmOptions);
    }

    async getSku(id: any): Promise<AxiosResponse<SkuDTO>> {
        const url = `${this.drmServerUrl}/api/v1/skus/${id}`;
        logger.debug(`EntitiesService.getSku withId:${id} from ${url}`);
        const bearerToken = await AuthenticationUtils.getServiceBearerToken(url);

        const drmOptions = {
            headers: {
                Authorization: `Bearer ${bearerToken}`,
            }
        };
        return axios.get<SkuDTO>(url, drmOptions);
    }
    
}
