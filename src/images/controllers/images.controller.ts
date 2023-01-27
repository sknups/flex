import express from "express";
import {StatusCodes} from "http-status-codes";
import {logger} from '../../logger'
import {ImagesService} from "../services/images.service";
import {SKUService, SkuDTO} from "../../entities/services/sku.service";
import {ItemService, ItemDTO } from "../../entities/services/item.service";
import {ImagesConfigs} from "../images.configs";
import {ImageType, Template} from "../model";
import {NotFoundError} from '../../entities/services/entities.service';

export class ImagesController {

    private readonly imagesService: ImagesService;
    private readonly skuService: SKUService;
    private readonly itemService: ItemService;

    constructor() {
        this.imagesService = new ImagesService();
        this.itemService = new ItemService();
        this.skuService = new SKUService();
    }

    async getSkuImage(request: express.Request, response: express.Response) {
        return this.getImage(request, response, 'sku')
    }

    async getItemImage(request: express.Request, response: express.Response) {
        let type: ImageType;
        if (request.params.type === 'card') {
            type = 'primary';
        } else if (request.params.type === 'back') {
            type = 'secondary';
        } else {
            type = request.params.type as ImageType;
        }
        return this.getImage(request, response, type)
    }

    async getImage(request: express.Request, response: express.Response, template: Template) {
        try {
            const code = request.params.code;
            const use = request.params.use;
            const index = request.params.index;

            let dto: SkuDTO | ItemDTO;

            if (template === 'sku') {
                dto = await this.skuService.get(code);
            } else {
                dto = await this.itemService.get(code);
            }

            const version = request.params.version;
            const format = request.params.format;
            let q = Number(request.query.q);
            if (isNaN(q) || q <= 0 || q > 1) {
                q = ImagesConfigs.DEFAULT_IMAGE_QUALITY;
            }

            logger.debug(`ImagesController.getImage version: ${version} tpl: ${template} purpose: ${use} with id: ${code}`);

            this.imagesService.generateCanvasImage(version, template, use, dto, index).then(canvas => {
                let buffer: Buffer;
                if (format == 'png') {
                    buffer = canvas.toBuffer();
                    logger.debug(`ImagesController.getImage png with buffer.length=${buffer.length}`);
                    response.writeHead(StatusCodes.OK, {
                        'Content-Type': 'image/png',
                        'Content-Length': buffer.length,
                        'Cache-Control': `public, max-age=${ImagesConfigs.TTL}`
                    });
                    response.write(buffer);
                    response.end(null, 'binary');
                } else {
                    buffer = canvas.toBuffer('image/jpeg', {quality: q});
                    logger.debug(`ImagesController.getImage jpeg with quality ${q} buffer.length=${buffer.length}`);
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
                response.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
                response.write('Failed to draw image');
                response.end();
            });
        } catch (err) {
            if (err instanceof NotFoundError) {
                response.writeHead(StatusCodes.NOT_FOUND);
                response.write('Failed to draw image (not found)');
                response.end();
            } else {
                logger.error(`ImagesController.getImage, Failed to get. ${err}`);
                response.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
                response.write('Failed to draw image');
                response.end();
            }
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
