import express from "express";
import { StatusCodes } from "http-status-codes";
import { logger } from '../../logger'
import { ImagesService } from "../services/images.service";
import { CertificateDTO, CertificatesService } from "../../certificates/services/certificates.service";
import { ImagesConfigs } from "../images.configs";
import { Canvas } from "canvas";

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

    async getImage(type: string, request: express.Request, response: express.Response) {
        logger.info(`ImagesController.getImage`);

        try {
            // request the certificate information
            const certCode = request.params.certCode;
            const certificateDTO = await this.getCertificate(certCode);
            const brandCode = certificateDTO.brandCode;
            const purpose = request.params.purpose;
            const version = request.params.version;
            const format = request.params.format;

            logger.info(`ImagesController.getImage version: ${version} type: ${type} purpose: ${purpose} from brand: ${brandCode} with certCode: ${certCode}`);

            this.imagesService.generateCanvasImage(version, type, purpose, certificateDTO, format).then(canvas => {
                
                if (format == 'png') {
                    var buffer = canvas.toBuffer();
                    logger.info(`ImagesController.getImage png with buffer.length=${buffer.length}`);
                    response.writeHead(StatusCodes.OK, {
                        'Content-Type': 'image/png',
                        'Content-Length': buffer.length,
                        'Cache-Control': `public, max-age=${ImagesConfigs.TTL}`
                    });
                    response.write(buffer);
                    response.end(null, 'binary');
                } else {
                    var buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
                    logger.info(`ImagesController.getImage jpeg with buffer.length=${buffer.length}`);
                    response.writeHead(StatusCodes.OK, {
                        'Content-Type': 'image/jpeg',
                        'Content-Length': buffer.length,
                        'Cache-Control': `public, max-age=${ImagesConfigs.TTL}`
                    });
                    response.write(buffer);
                    response.end(null, 'binary');
                }

            }).catch((err) => {
                logger.error(`ImagesController.getImage ERROR. Failed to render canvas: ${err}`);
                response.writeHead(StatusCodes.NOT_FOUND);
                response.write('Failed to draw image');
                response.end();
            });
        } catch (err) {
            logger.error(err);
            response.writeHead(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
        }

    }

    async getEntityImage(request: express.Request, response: express.Response) {
        logger.info(`ImagesController.getSkuImage`);

        try {
            const entity = request.params.entity;
            const entityCode = request.params.entityCode;
            const version = request.params.version;
            const purpose = request.params.purpose;
            const format = request.params.format;

            this.imagesService.getBucketImage(`${entity}.${version}.${purpose}.${entityCode}.${format}`)
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
            response.writeHead(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
        }
    }

    async getCertificate(withId: string): Promise<CertificateDTO> {
        const response = await this.certificateService.getCertificate(withId);
        return response.data;
    }

}
