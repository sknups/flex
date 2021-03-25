import axios from "axios";
import logger from "winston";

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
    getSku(withCode: string) {
        logger.info(`SkusService.getSku withCode:${withCode} from ${this.serverUrl}/v1/api/skus/${withCode}`);
        return axios.get<SkuDTO>(`${this.serverUrl}/v1/api/assets/${withCode}`);
    }
}
