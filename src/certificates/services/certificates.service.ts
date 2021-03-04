import axios from "axios";

export class CertificatesService {
    private readonly serverUrl: string;

    constructor() {
        this.serverUrl = [process.env.DRM_SERVER].join('/');
    }

    getCertificate(withId: string) {
        return axios.get<any>(`${this.serverUrl}/v1/api/assets/${withId}`);
    }
}
