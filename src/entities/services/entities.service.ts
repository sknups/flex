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
    created: Date;
    updated: Date;
    maxQty: number;
    description: string;
    rarity: number;
    brandCode: string;
    brandName: string;
    platformCode: string;
    platformName: string;
    designItemCode: string;
    designItemName: string;
    brandWholesalePrice: number;
    platformWholesalePrice: number;
    recommendedRetailPrice: number;
}

export class EntitiesService {
    private readonly drmServerUrl: string = 'https://drm-service-dev.sknups.gg';

    constructor() {
        if (process.env.DRM_SERVER) this.drmServerUrl = [process.env.DRM_SERVER].join('/');
    }

    /**
     * Get an item from ID
     * @param withId
     * @param withEmail
     */
    async getItem(withId: any, withEmail?: any): Promise<AxiosResponse<ItemDTO>> {
        const url = `${this.drmServerUrl}/api/v1/items/flex/${withId}`;
        logger.debug(`EntitiesService.getItem withId:${withId} from ${url}`);
        const bearerToken = await AuthenticationUtils.getServiceBearerToken(url);

        const drmOptions = {
            headers: {
                Authorization: `Bearer ${bearerToken}`,
            },
            params: {
                email: withEmail
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
