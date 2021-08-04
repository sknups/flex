import express from "express";
import querystring from "querystring";
import { StatusCodes } from "http-status-codes";
import { logger } from '../../logger'
import { ImagesService } from "../services/images.service";
import { CertificateDTO, CertificatesService } from "../../certificates/services/certificates.service";
import { ImagesConfigs } from "../images.configs";
import { Canvas } from "canvas";
import { BrandTemplate } from "templates/BrandTemplate";

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
        try {
            // request the certificate information
            const type = request.params.type;
            const certCode = request.params.certCode;
            const certificateDTO = await this.getCertificate(certCode);
            const brandCode = certificateDTO.brandCode;
            const use = request.params.use;
            const version = request.params.version;
            const format = request.params.format;
            let q = Number(request.query.q);
            if(isNaN(q) || q <= 0 || q >= 1) {
                q = ImagesConfigs.QUALITY;
            }


            logger.info(`ImagesController.getImage version: ${version} type: ${type} purpose: ${use} from brand: ${brandCode} with certCode: ${certCode}`);

            this.imagesService.generateCanvasImage(version, type, use, certificateDTO).then(canvas => {
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
                    var buffer = canvas.toBuffer('image/jpeg', { quality: q });
                    logger.info(`ImagesController.getImage jpeg with quality ${q} buffer.length=${buffer.length}`);
                    response.writeHead(StatusCodes.OK, {
                        'Content-Type': 'image/jpeg',
                        'Content-Length': buffer.length,
                        'Cache-Control': `public, max-age=${ImagesConfigs.TTL}`
                    });
                    response.write(buffer);
                    response.end(null, 'binary');
                }

            }).catch((err) => {
                logger.error(`ImagesController.getImage ERROR. Failed to render canvas: ${err}.  Check AUTH_TOKEN.`);
                response.writeHead(StatusCodes.NOT_FOUND);
                response.write('Failed to draw image');
                response.end();
            });
        } catch (err) {
            logger.error(err);
            response.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
            response.write('Failed to draw image');
            response.end();
        }

    }

    async getEntityImage(request: express.Request, response: express.Response) {
        try {
            const entity = request.params.entity;
            const entityCode = request.params.entityCode;
            const version = request.params.version;
            const purpose = request.params.purpose;
            const format = request.params.format;

            this.imagesService.getBucketImage(`${entity}.${version}.${purpose}.${entityCode}.${format}`)
                .then((buffer) => {
                    let contentType = 'image/png';
                    if(format == 'jpg' || format=='jpeg'){
                        contentType = 'image/jpeg';
                    } else if (format == 'mp4') {
                        contentType = 'video/mp4';
                    } else if (format == 'glb') {
                        contentType = 'model/gltf-binary';
                    }
                    logger.info(`ImagesController.getEntityImage with buffer.length=${buffer.length} and format ${format} and contentType $`);
                    response.writeHead(StatusCodes.OK, {

                        'Content-Type': 'image/png',
                        'Content-Length': buffer.length
                    });
                    response.write(buffer);
                    response.end(null, 'binary');
                })
                .catch((err) => {
                    logger.error(`ImagesController.getEntityImage ERROR. ${err}`);

                    response.writeHead(StatusCodes.NOT_FOUND);
                    response.write('Failed to draw image');
                    response.end();
                });
        } catch (err) {
            logger.info(`ImagesController.getEntityImage ERROR. Failed to get. ${err}`);
            response.writeHead(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
        }
    }

    async getCertificate(withId: string): Promise<CertificateDTO> {
        const response = await this.certificateService.getCertificate(withId);
        return response.data;
    }

}
