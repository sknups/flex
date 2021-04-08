import axios, {AxiosResponse} from "axios";
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
    getSku(withCode: string): Promise<AxiosResponse<SkuDTO>> {
        logger.info(`SkusService.getSku withCode:${withCode} from ${this.serverUrl}/v1/api/skus/${withCode}`);

        const url = `${this.serverUrl}/v1/api/skus/${withCode}`;
        const metadataUrl = `http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=${url}`;
        const options = {
            headers: {
                'Metadata-Flavor': 'Google'
            }
        };

        const bearerToken = axios.get(metadataUrl, options)
            .then((res: any) => {
                logger.info(res.data);
                return res.data;
            }).catch((error: any) => {
                logger.error(error);
                throw new Error(error);
            });

        return bearerToken.then((token: any) => {
            const drmOptions = {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            };
            return axios.get<SkuDTO>(url, drmOptions);
        }).catch(error => {
            logger.error(error);
            throw new Error(error);
        });
    }
}
