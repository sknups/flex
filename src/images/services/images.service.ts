import { CertificateDTO } from "../../certificates/services/certificates.service";
import { StringUtils } from "../../utils/string.utils";
import logger from "winston";
import { BrandTemplate } from "../../templates/BrandTemplate";
import * as fs from "fs";
import { SkuDTO } from "../../skus/services/skus.service";
import { Storage } from " ../../@google-cloud/storage";
import { Image, loadImage } from "canvas";

export class ImagesService {

    constructor(){

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
            console.error(error);

            logger.info(`ImagesService.generateCanvasImage Unable to get the Brand Template for ${brandcode}:${brandCodeToClassName}`)

            const defaultTemplateModule = await import('../../templates/default/DefaultTemplate');
            const templateController = new defaultTemplateModule.DefaultTemplate();

            return templateController.renderTemplate(fromCertificate, brandCode);
        }
    }

    async getImage(name: string): Promise<Buffer> {
        const storage = new Storage();
        const bucket = await storage.bucket(`assets-dev.sknups.gg`);
        const getRawBody = require('raw-body');
        logger.info(bucket.name);
        const file = bucket.file(name);
        return getRawBody(file.createReadStream());
    }

    /**
     * Will load any image whose name includes 'static' from the filesystem, and all others from the asset bucket
     * @param name The name or path of the file to load
     */
    getCanvasImage(name: string): Promise<Image> {
        if (name.includes('static')) {
            return loadImage(name);
        } else {
            this.getImage(name).then((res: string | Buffer) => {
                return loadImage(res);
            }).catch((err : Error) =>{
                logger.error(`ImagesService.getCanvasImage name ="${name}" error="${err}"`);
            });
        }
        return new Promise<Image>((resolve, reject) => {
            reject();
        });
    }

    getSkuImage(skuCode: string): Promise<Buffer> {
        return this.getImage(`sku.v1.default.${skuCode}.png`);
    }


}
