import { CommonRoutesConfig } from "../../common/common.routes.config";
import express from "express";
import {ImagesController} from "../controllers/images.controller";
import {logger } from '../../logger'

export class ImagesRoutesConfig extends CommonRoutesConfig {

    private readonly imagesController: ImagesController;

    constructor(app: express.Application) {
        super(app, 'Images Routes');

        this.imagesController = new ImagesController();
    }

    configureRoutes(): express.Application {
        logger.info(`Images.routes.config`)

        // Root of Request
        this.getApp().route(`/img`)
            .get((req, res) => this.imagesController.index(req, res));

        this.getApp()
            .route('/skn/:version/:type(card|back|cert)/:use/:certCode.:format')
            .get((req, res) => this.handleSknImageRequest(req, res));
  
        this.getApp()
            .route('/img/:entity/:version/:purpose/:entityCode.:format')
            .get((req, res) => this.handleBucketImageRequest(req, res));

        return this.getApp();
    }


    private handleSknImageRequest(request: express.Request, response: express.Response) {
        logger.info(`ImagesRoutesConfig.handleImageRequest for: ${JSON.stringify(request.params)}`);
        this.imagesController.getImage(request.params.type, request, response).then(() => {
            logger.info(`imagesController.getSknImage success`);
        }).catch((err) => {
            logger.info(`imagesController.getCertImage error: ${err}`);
        });
    }

    private handleBucketImageRequest(request: express.Request, response: express.Response) {
        logger.info(`ImagesRoutesConfig.handleImageRequest for: ${JSON.stringify(request.params)}`);
        this.imagesController.getEntityImage(request, response).then(() => {
            logger.info(`imagesController.getEntityImage success`);
        }).catch((err) => {
            logger.info(`imagesController.getEntityImage error: ${err}`);
        });
    }
}
