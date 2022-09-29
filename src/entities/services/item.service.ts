import { logger } from '../../logger'
import { EntityService } from "./entities.service";

export interface ItemDTO {
    token: string,
    brand: string,
    card: CardDTO | null,
    giveaway: string,
    description: string,
    maximum: number,
    issue: number,
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

export class ItemService extends EntityService {

    constructor() {
        super();
    }

    async get(id: any): Promise<ItemDTO> {
        logger.debug(`ItemService.get ${id}`);
        return (await this._api.get<ItemDTO>(id)).data;
    }

    protected getBaseURL(): string {
        const defaultBaseURL = 'https://europe-west1-drm-apps-01-43b0.cloudfunctions.net/get-flex-item';
        return process.env.GET_SKU_CLOUD_FUNCTION ? process.env.GET_SKU_CLOUD_FUNCTION : defaultBaseURL;
    }

    protected getName(): string {
        return 'get-flex-item'
    }
}

