import express from "express";
import {StatusCodes} from "http-status-codes";
import {logger} from '../../logger'
import {ImagesService} from "../services/images.service";
import {EntitiesService} from "../../entities/services/entities.service";
import {ImagesConfigs} from "../images.configs";

export class ImagesController {

    private readonly imagesService: ImagesService;
    private readonly entitiesService: EntitiesService;

    constructor() {
        this.imagesService = new ImagesService();
        this.entitiesService = new EntitiesService();
    }

    index(request: express.Request, response: express.Response) {

        logger.info(`ImagesController.index`);

        response.status(StatusCodes.OK).render('index', {
            title: 'ImagesController',
            message: 'Hello World from ImagesController'
        });
    }

    getTemplate(kind: string, type: string): string {
        if (kind === 'sku') {
            return kind;
        } else {
            return type;
        }
    }

    async getImage(request: express.Request, response: express.Response, kind: string) {
        try {
            const code = request.params.code;
            const use = request.params.use;
            const template = this.getTemplate(kind, request.params.type);

            let dto;
            let brandCode: string;

            if (template === 'sku') {
                dto = await this.entitiesService.getSku(code);
                brandCode = dto.brandCode;
            } else {
                dto = await this.entitiesService.getItem(code);
                brandCode = dto.brandCode;
            }

            const version = request.params.version;
            const format = request.params.format;
            let q = Number(request.query.q);
            if (isNaN(q) || q <= 0 || q > 1) {
                q = ImagesConfigs.DEFAULT_IMAGE_QUALITY;
            }

            logger.info(`ImagesController.getImage version: ${version} tpl: ${template} purpose: ${use} from brand: ${brandCode} with id: ${code}`);

            this.imagesService.generateCanvasImage(version, template, use, dto, brandCode).then(canvas => {
                let buffer: Buffer;
                if (format == 'png') {
                    buffer = canvas.toBuffer();
                    logger.info(`ImagesController.getImage png with buffer.length=${buffer.length}`);
                    response.writeHead(StatusCodes.OK, {
                        'Content-Type': 'image/png',
                        'Content-Length': buffer.length,
                        'Cache-Control': `public, max-age=${ImagesConfigs.TTL}`
                    });
                    response.write(buffer);
                    response.end(null, 'binary');
                } else {
                    buffer = canvas.toBuffer('image/jpeg', {quality: q});
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
                    logger.debug(`ImagesController.getEntityImage with buffer.length=${buffer.length} and format ${format} and contentType ${contentType}`);

                    response.writeHead(StatusCodes.OK, {
                        'Content-Type': contentType,
                        'Content-Length': buffer.length,
                        'Cache-Control': `public, max-age=${ImagesConfigs.TTL}`
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
            response.writeHead(StatusCodes.INTERNAL_SERVER_ERROR).send('Error drawing image');
        }
    }

}
