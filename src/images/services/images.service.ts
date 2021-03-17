import {CertificateDTO} from "../../certificates/services/certificates.service";
import {StringUtils} from "../../utils/string.utils";
import logger from "winston";
import {BrandTemplate} from "../../templates/BrandTemplate";

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
            console.error(error);

            logger.info(`ImagesService.generateCanvasImage Unable to get the Brand Template for ${brandcode}:${brandCodeToClassName}`)

            const defaultTemplateModule = await import('../../templates/default/DefaultTemplate');
            const templateController = new defaultTemplateModule.DefaultTemplate();

            return templateController.renderTemplate(fromCertificate, use);
        }
    }
}
