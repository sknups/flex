import { CertificateDTO } from "../../certificates/services/certificates.service";
import { StringUtils } from "../../utils/string.utils";
import logger from "winston";
import { BrandTemplate } from "../../templates/BrandTemplate";
import * as fs from "fs";
import { SkuDTO } from "../../skus/services/skus.service";
import { Bucket, Storage } from " ../../@google-cloud/storage";
import { Image, loadImage } from "canvas";

export class ImagesService {

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

    async generateCanvasImage(fromCertificate: CertificateDTO) {
        const brandCode = fromCertificate.brandCode;
        const brandCodeToClassName = StringUtils.classify(brandCode.toLowerCase());

        logger.info(`ImagesService.generateCanvasImage Will try to load the brandeCode: ${brandCode} template with name ${brandCodeToClassName}`)

        try {
            const brandModule = await import(`../../templates/brands/${brandCodeToClassName}`);
            const brandTemplateController: BrandTemplate = new brandModule[brandCodeToClassName];

            return brandTemplateController.renderTemplate(fromCertificate, brandCode);
        } catch (error) {
            logger.info(`ImagesService.generateCanvasImage Unable to get the Brand Template for ${brandCode}:${brandCodeToClassName}`)

            const defaultTemplateModule = await import('../../templates/default/DefaultTemplate');
            const templateController = new defaultTemplateModule.DefaultTemplate();

            return templateController.renderTemplate(fromCertificate, brandCode);
        }
    }

    async getImage(name: string): Promise<Buffer> {
        const bucket = await this.bucket;
        const getRawBody = require('raw-body');
        const file = this.bucket.file(name);
        return getRawBody(file.createReadStream());
    }

    /**
     * Will load any image whose name includes 'static' from the filesystem, and all others from the asset bucket
     * @param name The name or path of the file to load
     */
    async getCanvasImage(name: string): Promise<Image> {
        if (name.includes('static')) {
            return loadImage(name);
        } else {
            try {
                let res = await this.getImage(name);
                return loadImage(res);
            } catch (err) {
                logger.error(`ImagesService.getCanvasImage name ="${name}" error="${err}"`);
                return new Promise<Image>((resolve, reject) => {
                    reject();
                });
            }
        }
    }

    getSkuImage(skuCode: string, version: string, purpose: string, extension: string): Promise<Buffer> {
        return this.getImage(`sku.${version}.${purpose}.${skuCode}.${extension}`);
    }

    getClaimBackground(claimCode: string, version: string, purpose: string, extension: string): Promise<Buffer> {
        logger.error(`Getting image with name: claim.${version}.${purpose}.${claimCode}.${extension}`);
        return this.getImage(`claim.${version}.${purpose}.${claimCode}.${extension}`);
    }

}
