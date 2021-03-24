import express from "express";
import {StatusCodes} from "http-status-codes";
import logger from "winston";
import {ImagesService} from "../services/images.service";
import {CertificateDTO, CertificatesService} from "../../certificates/services/certificates.service";

export class ImagesController {

    private readonly imagesService: ImagesService;
    private readonly certificateService: CertificatesService;

    constructor() {
        this.imagesService = new ImagesService();
        this.certificateService = new CertificatesService();
    }

    index(request: express.Request, response: express.Response) {

        logger.info(`ImagesController.index`);

        response.status(StatusCodes.OK).render('index', {
            title: 'ImagesController',
            message: 'Hello World from ImagesController'
        });
    }

    async getImage(request: express.Request, response: express.Response) {
        logger.info(`ImagesController.getImage`);

        const itemId = request.params.itemId;
        const image = request.params.imageType;

        logger.info(`ImagesController.getImage from: ${itemId} with image: ${image}`);

        try {
            // request the certificate information
            const certificateDTO = await this.getCertificate(itemId);

            // Legacy Info for now
            this.imagesService.generateCanvasImage(certificateDTO, image)
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

        const itemId = request.params.itemId;

        try {
            logger.info(`Item Id: ${itemId}`);

            // request the certificate information
            const certificateDTO = await this.getCertificate(itemId);

            this.imagesService.getSkuImage(certificateDTO)
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
            this.handleCanvasImageError(response, err);
        }
    }

    async getCertificate(withId: string): Promise<CertificateDTO> {
        const response = await this.certificateService.getCertificate(withId);
        return response.data;
    }

    handleCanvasImageError(response: express.Response, err: any) {
        response.writeHead(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
    }
}
