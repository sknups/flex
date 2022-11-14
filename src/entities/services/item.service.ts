import { logger } from '../../logger'
import { EntityApiError, EntityService } from "./entities.service";

interface ItemDTOInternal {
    token: string,
    brand: string,
    card: CardDTO | null,
    cardJson: string | null
    giveaway: string,
    description: string,
    maximum: number,
    issue: number,
    sku: string,
    name: string,
    rarity: number | null,
    version: string,
}

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
        const response = (await this._api.get<ItemDTOInternal>(`SKN/${id}`)).data;
        try {
            response.card = !response.cardJson ? null : JSON.parse(response.cardJson)
        } catch (e) {
            const message = `Failed to parse cardJson for item '${id}' of sku '${response.sku}'`
            logger.error(`${message} - ${e}`)
            throw new CardJsonError(message)
        }
        return response;
    }

    protected getBaseURL(): string {
        const defaultBaseURL = 'https://europe-west2-drm-apps-01-43b0.cloudfunctions.net/drm-get-item';
        return process.env.DRM_GET_ITEM_CLOUD_FUNCTION ? process.env.DRM_GET_ITEM_CLOUD_FUNCTION : defaultBaseURL;
    }

    protected getName(): string {
        return 'drm-get-item'
    }
}

export class CardJsonError extends EntityApiError {
    constructor(message: string) {
        super(message);
    }
}
