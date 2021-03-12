import {CertificateDTO} from "../../certificates/services/certificates.service";
import {StringUtils} from "../../utils/string.utils";
import logger from "winston";
import {ITemplate} from "../../templates/ITemplate";

export class ImagesService {

    async generateCanvasImage(fromCertificate: CertificateDTO, use: string) {
        const {brandcode} = fromCertificate;
        const brandCodeToClassName = StringUtils.classify(brandcode.toLowerCase());

        logger.info(`ImagesService.generateCanvasImage Will try to load the brandeCode: ${brandcode} template with name ${brandCodeToClassName}`)

        try {
            const brandModule = await import(`../../templates/brands/${brandCodeToClassName}`);
            const brandTemplateController: ITemplate = new brandModule[brandCodeToClassName];

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
