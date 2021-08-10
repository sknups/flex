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
    displayName: string;
    emailHash: string;
    flexHost: string;
    gamerTag: string;
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
        logger.info(`CertificatesService.getCertificate withId:${withId} from ${this.drmServerUrl}/v1/api/assets/${withId}`);
        const url = `${this.drmServerUrl}/v1/api/assets/${withId}`;
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
