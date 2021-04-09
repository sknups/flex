import axios, {AxiosResponse} from "axios";
import logger from "winston";
import {AuthenticationUtils} from "../../utils/authentication.utils";

export interface SkuDTO {
    // FIX DTO
    code: string;
    brandCode: string;
    designItemCode: string;
    image: string;
}

export class SkusService {
    private readonly serverUrl: string;

    constructor() {
        this.serverUrl = [process.env.DRM_SERVER].join('/');
    }

    /**
     * Get a sku from skuCode
     * @param withCode
     */
    async getSku(withCode: string): Promise<AxiosResponse<SkuDTO>> {
        logger.info(`SkusService.getSku withCode:${withCode} from ${this.serverUrl}/v1/api/skus/${withCode}`);
        const url = `${this.serverUrl}/v1/api/skus/${withCode}`;
        const bearerToken = AuthenticationUtils.getServiceBearerToken(this.serverUrl);

        const drmOptions = {
            headers: {
                Authorization: `Bearer ${bearerToken}`,
            }
        };

        return axios.get<SkuDTO>(url, drmOptions);

    }
}
