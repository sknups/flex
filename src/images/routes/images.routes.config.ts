import {CommonRoutesConfig} from "../../common/common.routes.config";
import express from "express";
import {ImagesController} from "../controllers/images.controller";
import {logger} from '../../logger'

export class ImagesRoutesConfig extends CommonRoutesConfig {

    private readonly imagesController: ImagesController;

    constructor(app: express.Application) {
        super(app, 'Images Routes');
        this.imagesController = new ImagesController();
    }

    configureRoutes(): express.Application {
        logger.info(`Images.routes.config`)

        this.getApp()
            .route('/skn/:version/:type(card|back)/:use/:code.:format')
            .get((req, res) => {
                logger.info(`ImagesRoutesConfig.handleImageRequest for: ${JSON.stringify(req.params)} and kind SKN`);
                this.imagesController.getItemImage(req, res).catch((err) => {
                    logger.info(`imagesController.getSknImage error: ${err}`);
                });
            });

        this.getApp()
            .route('/sku/:version/:type(card)/:use(metaplex)/:code.:format')
            .get((req, res) => {
                logger.info(`ImagesRoutesConfig.handleImageRequest for: ${JSON.stringify(req.params)} and kind SKU`);
                this.imagesController.getSkuImage(req, res).catch((err) => {
                    logger.info(`imagesController.getSkuImage error: ${err}`);
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
