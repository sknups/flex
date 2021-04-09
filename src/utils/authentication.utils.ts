import axios from "axios";
import logger from "winston";

export class AuthenticationUtils {
    static getServiceBearerToken(serviceUrl: string): Promise<string> {
        const metadataUrl = `http://metadata/computeMetadata/v1/instance/service-accounts/flex-ui@drm-apps-01-43b0.iam.gserviceaccount.com/identity?audience=${serviceUrl}`;
        const options = {
            headers: {
                'Metadata-Flavor': 'Google'
            }
        };

        logger.debug(`AuthenticationUtils.getServiceBearerToken  metadataUrl=${metadataUrl}`);
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
