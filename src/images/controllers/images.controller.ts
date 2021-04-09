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

    async getCertImage(request: express.Request, response: express.Response) {
        logger.info(`ImagesController.getImage`);

        try {
            // request the certificate information
            const certCode = request.params.certCode;

            const certificateDTO = await this.getCertificate(certCode);

            const brandCode = certificateDTO.brandCode;

            logger.info(`ImagesController.getCertImage from brand: ${brandCode} with certCode: ${certCode}`);

            // Legacy Info for now
            this.imagesService.generateCanvasImage(certificateDTO)
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

    async getSkuImage(request: express.Request, response: express.Response) {
        logger.info(`ImagesController.getSkuImage`);

        const skuCode = request.params.skuCode;

        try {
            logger.info(`SkuCode: ${skuCode}`);

            // request the certificate information
            const skuDto = await this.getSku(skuCode);

            this.imagesService.getSkuImage(skuDto)
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
                    logger.error(`ImagesController.getSkuImage ERROR. Failed to draw image`);

                    response.writeHead(StatusCodes.NOT_FOUND);
                    response.write('Failed to draw image');
                    response.end();
                });
        } catch (err) {
            if (err.response) {
              // Request made and server responded
              logger.error(`ImagesController.getSkuImage ERROR. response data=${err.response.data}`);
              logger.error(`ImagesController.getSkuImage ERROR. response status=${err.response.status}`);
              logger.error(`ImagesController.getSkuImage ERROR. response header=${err.response.headers}`);                        
            } else if (err.request) {
              // The request was made but no response was received                        
              logger.error(`ImagesController.getSkuImage ERROR. request error=${err.request}`);
            }
            logger.info(`ImagesController.getSkuImage ERROR. Failed to get `);
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
