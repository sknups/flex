import logger from "winston";
import { Storage } from "@google-cloud/storage";

export class AssetsService {

    private bucket;

    constructor() {
        let srv: String;
        switch (process.env.ENVIRONMENT) {
            case null:
                logger.warn("Warn - no env var ENVIRONMENT - defaulting to DEV");
                this.bucket = new Storage().bucket('assets-dev.sknups.gg');
                break;
            case 'live':
                this.bucket = new Storage().bucket('assets.sknups.gg');
                break;
            default:
                this.bucket = new Storage().bucket(`assets-${process.env.ENVIRONMENT}.sknups.gg`);
                break;

        }
    }

    async getAsset(name: string): Promise<Buffer> {
        const bucket = await this.bucket;
        const getRawBody = require('raw-body');
        const file = this.bucket.file(name);
        return getRawBody(file.createReadStream());
    }

    getClaimWinnerAnimation(claimCode: string, version: string, purpose: string, extension: string): Promise<Buffer> {
        return this.getAsset(`claim.${version}.${purpose}.${claimCode}.${extension}`);
    }

}
