import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, } from "axios";
import dayjs from "dayjs";
import { logger } from '../../logger'
import { IdentityToken } from "./identity-token";

const MIN_TOKEN_EXPIRY_MIN = 2


/**
 * An Axios interceptor which has no effect.
 */
const NULL_INTERCEPTOR = <T>(obj: T) => obj;

export abstract class EntityService {
    protected _api: AxiosInstance;
    private _authTokenAPI: AxiosInstance;
    private _identityToken: IdentityToken;

    constructor() {
        this._api = axios.create({
            baseURL: this.getBaseURL(),
        })
        this.authenticateRequests(this._api);
        this.transformErrors(this._api);

        this._authTokenAPI = axios.create({            
            headers: {
                'Metadata-Flavor': 'Google'
            }
        })
        this.transformMetadataErrors(this._authTokenAPI);
        this._identityToken = new IdentityToken(null)
    }

    protected abstract getBaseURL(): string;

    protected abstract getName(): string;

    private authenticateRequests(instance: AxiosInstance): void {
        instance.interceptors.request.use(async (config: AxiosRequestConfig) => {
            let token = "";
            try {
                token = await this.getBearerToken()
            } catch (error) {
                logger.error(`Error getting bearer token '${error}'`)
                return config;
            }
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
            return config;
        })
    }

    private static now() {
        return dayjs()
    }

    private async getBearerToken(): Promise<string> {
        const minimumExpiry = EntityService.now().add(MIN_TOKEN_EXPIRY_MIN, 'minutes')

        if (this._identityToken.valid() && this._identityToken.expiry.isAfter(minimumExpiry)) {
            return Promise.resolve(this._identityToken.value);
        }

        if (process.env.GOOGLE_AUTH_TOKEN) {
            logger.warn(`Using process.env.GOOGLE_AUTH_TOKEN for auth token`)
            this.setIdentityToken(process.env.GOOGLE_AUTH_TOKEN);
        } else {                                    
            const identityURL = `http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=${this.getBaseURL()}`;                        
            const token = (await  this._authTokenAPI.get(identityURL)).data;                        
            this.setIdentityToken(token);
        }

        return Promise.resolve(this._identityToken.value);
    }

    private setIdentityToken(token: string) {
        const identityToken = new IdentityToken(token);
        const minimumExpiry = EntityService.now().add(MIN_TOKEN_EXPIRY_MIN, 'minutes')

        if (!identityToken.valid()) {
            throw new Error('identity token is invalid')
        }

        if (identityToken.expiry.isBefore(minimumExpiry)) {
            throw new Error('identity token is stale')
        }

        this._identityToken = identityToken
    }

    /**
    * Adds an Axios interceptor which transforms AxiosError -> EntityApiError
    */
    private transformErrors(instance: AxiosInstance): void {

        instance.interceptors.response.use(NULL_INTERCEPTOR, (error: AxiosError) => {
            logger.error(error.toJSON());
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 404:
                        // e.g. trying to get SKU which doesn't exist
                        throw new NotFoundError(`404 returned from ${this.getName()}`);
                    default: {
                        // e.g. unrecoverable network errors, 5xx returned by server, etc..
                        const errorData = error.response.data ? error.response.data : '';
                        throw new EntityApiError(`Received ${error.response.status} response from ${this.getName()} ${errorData}`);
                    }
                }
            } else if (error.request) {
                throw new EntityApiError(`No response from ${this.getName()} ${error.request}`);
            } else {
                throw new EntityApiError(`Cannot send request to ${this.getName()} ${error.message}`);
            }
        });
    }

    private transformMetadataErrors(instance: AxiosInstance): void {
        instance.interceptors.response.use(NULL_INTERCEPTOR, (error: AxiosError) => {
            logger.error(error.toJSON());
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data ? error.response.data : '';
                throw new EntityApiError(`Received ${status} response from metadata service ${errorData}`);
            } else if (error.request) {
                throw new EntityApiError(`No response from metadata service ${error.request}`);
            } else {
                throw new EntityApiError(`Cannot send request to metadata service ${error.message}`);
            }
        });
    }
    
}


export class EntityApiError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class NotFoundError extends EntityApiError {
    constructor(message: string) {
        super(message);
    }
}