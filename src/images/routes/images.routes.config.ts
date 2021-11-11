import { CommonRoutesConfig } from "../../common/common.routes.config";
import express from "express";
import { ImagesController } from "../controllers/images.controller";
import { logger } from '../../logger'

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
            .route('/skn/:version/:type(card|back|cert)/:use/:code.:format')
            .get((req, res) => {
                logger.info(`ImagesRoutesConfig.handleImageRequest for: ${JSON.stringify(req.params)}`);
                this.imagesController.getImage(req, res).then(() => {
                    //logger.info(`imagesController.getSknImage success`);
                }).catch((err) => {
                    logger.info(`imagesController.getCertImage error: ${err}`);
                });
            });

        this.getApp()
            .route('/:type(sku)/:version/metaplex/:code.:format')
            .get((req, res) => {
                logger.info(`ImagesRoutesConfig.handleImageRequest for: ${JSON.stringify(req.params)}`);
                this.imagesController.getImage(req, res).then(() => {
                }).catch((err) => {
                    logger.info(`imagesController.getImage error: ${err}`);
                });
            });

        this.getApp()
            .route('/img/:entity/:version/:purpose/:entityCode.:format')
            .get((req, res) => {
                logger.info(`ImagesRoutesConfig.handleImageRequest for: ${JSON.stringify(req.params)}`);
                this.imagesController.getEntityImage(req, res).then(() => {
                    logger.info(`imagesController.getEntityImage success`);
                }).catch((err) => {
                    logger.info(`imagesController.getEntityImage error: ${err}`);
                });
            });

        return this.getApp();
    }
}
