import {CertificateDTO} from "../../certificates/services/certificates.service";
import {StringUtils} from "../../utils/string.utils";
import logger from "winston";
import {BrandTemplate} from "../../templates/BrandTemplate";
import * as fs from "fs";

export class ImagesService {

    async generateCanvasImage(fromCertificate: CertificateDTO, use: string) {
        const {brandCode} = fromCertificate;
        const brandCodeToClassName = StringUtils.classify(brandCode.toLowerCase());

        logger.info(`ImagesService.generateCanvasImage Will try to load the brandeCode: ${brandCode} template with name ${brandCodeToClassName}`)

        try {
            const brandModule = await import(`../../templates/brands/${brandCodeToClassName}`);
            const brandTemplateController: BrandTemplate = new brandModule[brandCodeToClassName];

            return brandTemplateController.renderTemplate(fromCertificate, use);
        } catch (error) {
            logger.info(`ImagesService.generateCanvasImage Unable to get the Brand Template for ${brandCode}:${brandCodeToClassName}`)

            const defaultTemplateModule = await import('../../templates/default/DefaultTemplate');
            const templateController = new defaultTemplateModule.DefaultTemplate();

            return templateController.renderTemplate(fromCertificate, use);
        }
    }

    async getSkuImage(cert: CertificateDTO): Promise<Buffer> {
        return new Promise<Buffer>((accept, reject) => {
            const brandCode = cert.brandCode;
            const skuCode = cert.stockKeepingUnitCode;
            const image = cert.image;

            logger.info(`ImagesService.getSkuImage: Will load image with brandCode: ${brandCode}, skuCode: ${skuCode}, imageName: ${image}`);

            const imagePath = `./static/assets/brands/${brandCode}/99999999/${skuCode}/v1/${image}.png`;

            logger.info(imagePath);
            fs.readFile(imagePath, (err, data) => {
                if (err) throw err; // Fail if the file can't be read.
                accept(data);
            });
        });
    }
}
