import axios, { AxiosResponse} from "axios";
import {logger } from '../../logger'
import {AuthenticationUtils} from "../../utils/authentication.utils";

export interface CertificateDTO {
    // FIX DTO
    id: string;
    gamerTag: string;
    displayName: string;
    saleQty: number;
    maxQty: number;
    stockKeepingUnitCode: string;
    stockKeepingUnitName: string;
    stockKeepingUnitImageName: string;
    brandCode: string;
    brand: string;
    description: string;
    platformCode: string;
    platformName: string;
    designItemCode: string;
    skuImageUrl: string;
    certImgUrl: string;
    cardImgUrl: string;
    backImgUrl: string;
    thumbprint: string;
    flexUrl: string;
    certUrl: string;
    sknappUrl: string;
    certificate: string;
    created: Date;
    test?: boolean;
    isOwner?: boolean;
}

export class CertificatesService {
    private readonly drmServerUrl: string;    

    constructor() {
        this.drmServerUrl = [process.env.DRM_SERVER].join('/');        
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
