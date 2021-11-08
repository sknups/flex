import axios, { AxiosResponse} from "axios";
import {logger } from '../../logger'
import {AuthenticationUtils} from "../../utils/authentication.utils";

export interface CertificateDTO {
    brandCode: string;
    brandName: string;
    brandWholesalePrice: number;
    brandWholesalerShare: number;
    certVersion: string;
    certificate: string;
    certificateFee: number;
    claimCode: string;
    created: Date;
    description: string;
    designItemCode: string;
    designItemName: string;
    flexHost: string;
    isOwner: boolean;
    maxQty: number;
    platformCode: string;
    platformName: string;
    platformWholesalePrice: number;
    platformWholesalerShare: number;
    recommendedRetailPrice: number;
    saleQty: number;
    sknappHost: string;
    sknappUrl: string;
    state: string;
    stockKeepingUnitCode: string;
    stockKeepingUnitName: string;
    stockKeepingUnitRarity: number;
    thumbprint: string;
    updated: Date;
}

export class CertificatesService {
    private readonly drmServerUrl: string = 'https://drm-dev.sknups.gg/';    

    constructor() {
        if (process.env.DRM_SERVER) this.drmServerUrl = [process.env.DRM_SERVER].join('/');        
    }

    /**
     * Get a certificate from ID
     * @param withId
     * @param withEmail
     */
    async getCertificate(withId: any, withEmail?: any): Promise<AxiosResponse<CertificateDTO>> {
        // endpoint /flex does not return all the necessary fields to render the image
        // endpoint /retail is the safest existing endpoint, as it returns all the necessary fields IF item is UNBOXED
        // if item is in state BOXED, some fields will be missing (such as all related to brand, to prevent spoilers)
        const url = `${this.drmServerUrl}/api/v1/items/retail/${withId}`;
        logger.info(`CertificatesService.getCertificate withId:${withId} from ${url}`);
        const bearerToken = await AuthenticationUtils.getServiceBearerToken(url);

        const drmOptions = {
            headers: {
                Authorization: `Bearer ${bearerToken}`,
            },
            params: {
                email: withEmail
            }
        };
        return axios.get<CertificateDTO>(url, drmOptions);
    }

    
}
