import axios from "axios";
import {logger } from '../logger'

export class AuthenticationUtils {
    static getServiceBearerToken(serviceUrl: string): Promise<string> {
        if (process.env.GOOGLE_AUTH_TOKEN){
            logger.warn(`Using process.env.GOOGLE_AUTH_TOKEN for auth token`)
            return Promise.resolve(process.env.GOOGLE_AUTH_TOKEN);
            
        }
        const metadataUrl = `http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=${serviceUrl}`;
        const options = {
            headers: {
                'Metadata-Flavor': 'Google'
            }
        };

        return axios.get(metadataUrl, options)
            .then((res: any) => {
                logger.debug(res.data);
                return res.data;
            }).catch((error: any) => {
                logger.error(error);
                throw new Error(error);
            });
    }
}
