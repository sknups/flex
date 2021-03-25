import axios from "axios";
import logger from "winston";

export interface CertificateDTO {
    // FIX DTO
    id: string;
    gamerTag: string;
    saleQty: number;
    stockKeepingUnitCode: string;
    stockKeepingUnit: string;
    brandCode: string;
    brand: string;
    description: string;
    platformCode: string;
    designItemCode: string;
    skuImageUrl: string;
    certImageUrl: string;
    max_qty: number;
    cur_qty: number;
    thumbprint: string;
    flex_url: string;
    cert_url: string;
    certificate: string;
    created: Date;
    test?: boolean;
}

export class CertificatesService {
    private readonly serverUrl: string;

    constructor() {
        this.serverUrl = [process.env.DRM_SERVER].join('/');
    }

    /**
     * Get All Certificates
     */
    getCertificates() {
        logger.info(`CertificatesService.getCertificates`);
        return axios.get<CertificateDTO[]>(`${this.serverUrl}/v1/api/assets`);
    }

    /**
     * Get a certificate from ID
     * @param withId
     */
    getCertificate(withId: string) {
        logger.info(`CertificatesService.getCertificate withId:${withId} from ${this.serverUrl}/v1/api/assets/${withId}`);
        return axios.get<CertificateDTO>(`${this.serverUrl}/v1/api/assets/${withId}`);
    }
}
