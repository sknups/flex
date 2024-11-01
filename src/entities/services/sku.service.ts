import { logger } from '../../logger'
import { EntityService } from "./entities.service";

export interface SkuDTO {
    code: string;
    name: string;
    version: string;
}

export class SKUService extends EntityService {

    constructor() {
        super();
    }

    async get(id: any): Promise<SkuDTO> {
        logger.debug(`SKUService.get ${id}`);
        return (await this._api.get<SkuDTO>(id)).data;
    }

    protected getBaseURL(): string {
        const defaultBaseURL = 'https://europe-west2-drm-apps-01-43b0.cloudfunctions.net/catalog-get-sku';
        return process.env.GET_SKU_CLOUD_FUNCTION ? process.env.GET_SKU_CLOUD_FUNCTION : defaultBaseURL;
    }

    protected getName(): string {
        return 'catalog-get-sku'
    }
}

