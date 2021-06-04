import express from "express";
import {StatusCodes} from "http-status-codes";
import logger from "winston";
import {ImagesService} from "../services/images.service";
import {CertificateDTO, CertificatesService} from "../../certificates/services/certificates.service";
import {SkuDTO, SkusService} from "../../skus/services/skus.service";

export class ImagesController {

    private readonly imagesService: ImagesService;
    private readonly certificateService: CertificatesService;
    private readonly skuService: SkusService;

    constructor() {
        this.imagesService = new ImagesService();
        this.certificateService = new CertificatesService();
        this.skuService = new SkusService();
    }

    index(request: express.Request, response: express.Response) {

        logger.info(`ImagesController.index`);

        response.status(StatusCodes.OK).render('index', {
            title: 'ImagesController',
            message: 'Hello World from ImagesController'
        });
    }

    async getImage(type: String, request: express.Request, response: express.Response) {
        logger.info(`ImagesController.getImage`);

        try {
            // request the certificate information
            const certCode = this.stripExtension(request.params.certCode);

            const certificateDTO = await this.getCertificate(certCode);

            const brandCode = certificateDTO.brandCode;

            logger.info(`ImagesController.getImage type: ${type} from brand: ${brandCode} with certCode: ${certCode}`);

            // Legacy Info for now
            this.imagesService.generateCanvasImage(type, certificateDTO)
                .then((buffer) => {
                    logger.info(`ImagesController.getImage with buffer.length=${buffer.length}`);

                    response.writeHead(StatusCodes.OK, {
                        'Content-Type': 'image/png',
                        'Content-Length': buffer.length
                    });
                    response.write(buffer);
                    response.end(null, 'binary');
                })
                .catch((err) => {
                    logger.error(`ImagesController.getImage ERROR. Failed to draw image`);

                    response.writeHead(StatusCodes.NOT_FOUND);
                    response.write('Failed to draw image');
                    response.end();
                });
        } catch (err) {
            this.handleCanvasImageError(response, err);
        }
    }

    stripExtension(value: string): string {
        const idx = value.indexOf(".png");
        return idx < 0 ? value : value.substr(0, idx); //stripping .png extension, if exists
    }

    async getSkuImage(request: express.Request, response: express.Response, fallback: boolean) {
        logger.info(`ImagesController.getSkuImage`);

        try {
            const skuCode = this.stripExtension(request.params.skuCode);
            const version = fallback ? "v1" : request.params.version;
            const purpose = fallback ? "default" : request.params.purpose;
            const extension = fallback ? "png" : request.params.extension;

            logger.info(`SkuCode: ${skuCode}`);

            // request the certificate information
            //const skuDto = await this.getSku(skuCode);
            // We shouldn't need this read - very inefficient - we just look for the skuCode directly

            this.imagesService.getSkuImage(skuCode, version, purpose, extension)
                .then((buffer) => {
                    logger.info(`ImagesController.getSkuImage with buffer.length=${buffer.length}`);

                    response.writeHead(StatusCodes.OK, {
                        'Content-Type': 'image/png',
                        'Content-Length': buffer.length
                    });
                    response.write(buffer);
                    response.end(null, 'binary');
                })
                .catch((err) => {
                    logger.error(`ImagesController.getSkuImage ERROR. ${err}`);

                    response.writeHead(StatusCodes.NOT_FOUND);
                    response.write('Failed to draw image');
                    response.end();
                });
        } catch (err) {
            logger.info(`ImagesController.getSkuImage ERROR. Failed to get`);            
            this.handleCanvasImageError(response, err);
        }
    }

    async getClaimBackground(request: express.Request, response: express.Response, fallback: boolean) {
        logger.info(`ImagesController.getClaimBackground`);

        try {
            const claimCode = this.stripExtension(request.params.claimCode);
            const version = fallback ? 'v1' : request.params.version;
            const purpose = fallback ? 'claimform' : request.params.purpose;
            const extension = fallback ? 'png' : request.params.extension;

            logger.info(`ClaimCode: ${claimCode}`);

            this.imagesService.getClaimBackground(claimCode, version, purpose, extension)
                .then((buffer) => {
                    logger.info(`ImagesController.getClaimBackground with buffer.length=${buffer.length}`);

                    response.writeHead(StatusCodes.OK, {
                        'Content-Type': 'image/' + extension,
                        'Content-Length': buffer.length
                    });
                    response.write(buffer);
                    response.end(null, 'binary');
                })
                .catch((err) => {
                    logger.error(`ImagesController.getClaimBackground ERROR. ${err}`);

                    response.writeHead(StatusCodes.NOT_FOUND);
                    response.write('Failed to draw image');
                    response.end();
                });
        } catch (err) {
            logger.info(`ImagesController.getClaimBackground ERROR. Failed to get`);
            this.handleCanvasImageError(response, err);
        }
    }

    async getCertificate(withId: string): Promise<CertificateDTO> {
        const response = await this.certificateService.getCertificate(withId);
        return response.data;
    }

    async getSku(withCode: string): Promise<SkuDTO> {
        const response = await this.skuService.getSku(withCode);
        return response.data;
    }

    handleCanvasImageError(response: express.Response, err: any) {
        response.writeHead(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
    }
}
