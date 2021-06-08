import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import logger from "winston";
import {AuthenticationUtils} from "../../utils/authentication.utils";

export interface CertificateDTO {
    // FIX DTO
    id: string;
    gamerTag: string;
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

export interface ProblemErrorResponse {
    title: string;
    status: string;
    detail: string;
    level: string;
}

export interface AssetActivationDTO {
    activated: boolean;
}

export class CertificatesService {
    private readonly drmServerUrl: string;
    private readonly consumerServerUrl: string;

    constructor() {
        this.drmServerUrl = [process.env.DRM_SERVER].join('/');
        this.consumerServerUrl = [process.env.ACTIVATION_SERVER].join('/');
    }

    /**
     * Get All Certificates
     */
    getCertificates() {
        logger.info(`CertificatesService.getCertificates`);
        return axios.get<CertificateDTO[]>(`${this.drmServerUrl}/v1/api/assets`);
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

    /**
     * Assign a certificate from ID and EMAIL
     * @param withId
     * @param withEmail
     */
    async assignCertificate(withId: any, withEmail: any): Promise<AxiosResponse<AssetActivationDTO>> {
        logger.info(`CertificatesService.assignCertificate withId:${withId} from ${this.consumerServerUrl}/v1/api/assets/assign`);
        const url = `${this.consumerServerUrl}/v1/api/assets/assign`;
        const bearerToken = await AuthenticationUtils.getServiceBearerToken(url);

        const consumerOptions = {
            params: {
                certCode: withId,
                email: withEmail
            }
        };

        return axios.get<AssetActivationDTO>(url, consumerOptions);
    }

    /**
     * Activate a certificate from ID and EMAIL
     * @param withId
     * @param withEmail
     */
    async activateCertificate(withId: any, withEmail: any): Promise<AxiosResponse<AssetActivationDTO>> {
        logger.info(`CertificatesService.activateCertificate withId:${withId} from ${this.consumerServerUrl}/v1/api/assets/activate`);
        const url = `${this.consumerServerUrl}/v1/api/assets/activate`;
        const bearerToken = await AuthenticationUtils.getServiceBearerToken(url);

        const consumerOptions = {
            params: {
                certCode: withId,
                email: withEmail
            }
        };

        return axios.get<AssetActivationDTO>(url, consumerOptions);
    }
}
