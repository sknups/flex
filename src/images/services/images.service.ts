import {CertificateDTO} from "../../certificates/services/certificates.service";
import {StringUtils} from "../../utils/string.utils";
import logger from "winston";
import {BrandTemplate} from "../../templates/BrandTemplate";
import * as fs from "fs";
import {SkuDTO} from "../../skus/services/skus.service";
import {Storage} from " ../../@google-cloud/storage";

export class ImagesService {

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

    async getImage(name: string): Promise<Buffer>{
        const storage = new Storage();
        const getRawBody = require('raw-body');
        const bucket = await storage.bucket(`assets-dev.sknups.gg`);
        logger.info(bucket.name);
        const file = bucket.file(name);
        return getRawBody(file.createReadStream());
    }

    getSkuImage(skuCode: string): Promise<Buffer>{
        return this.getImage(`sku.v1.default.${skuCode}.png`);
    }

 
}
