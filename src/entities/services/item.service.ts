import { logger } from '../../logger'
import { EntityApiError, EntityService } from "./entities.service";

export interface ItemDTO {
    token: string,
    brand: string,
    giveaway: string,
    description: string,
    maximum: number,
    issue: number,
    sku: string,
    name: string,
    rarity: number | null,
    version: string,
    media: MediaDTO | null;
}

export interface MediaDTO {
    primary: MediaLabelsDTO;
    secondary: MediaLabelsDTO[];
}

export interface MediaLabelsDTO {
    labels: LabelDTO[];
}

export interface LabelDTO {
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
        return (await this._api.get<ItemDTO>(`SKN/${id}`)).data;
    }

    protected getBaseURL(): string {
        const defaultBaseURL = 'https://europe-west2-drm-apps-01-43b0.cloudfunctions.net/item-get';
        return process.env.DRM_GET_ITEM_CLOUD_FUNCTION ? process.env.DRM_GET_ITEM_CLOUD_FUNCTION : defaultBaseURL;
    }

    protected getName(): string {
        return 'item-get'
    }
}

export class CardJsonError extends EntityApiError {
    constructor(message: string) {
        super(message);
    }
}
