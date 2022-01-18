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

    handleImageRequest(req: express.Request, res: express.Response, kind: string) {
        logger.info(`ImagesRoutesConfig.handleImageRequest for: ${JSON.stringify(req.params)} and kind ${kind}`);

        this.imagesController.getImage(req, res, kind).then(() => {
        }).catch((err) => {
            logger.info(`imagesController.getImage error: ${err}`);
        });
    }

    configureRoutes(): express.Application {
        logger.info(`Images.routes.config`)

        // Root of Request
        this.getApp().route(`/img`)
            .get((req, res) => this.imagesController.index(req, res));

        this.getApp()
            .route('/skn/:version/:type(card|back)/:use/:code.:format')
            .get((req, res) => {
                this.handleImageRequest(req, res, 'skn');

            });

        this.getApp()
            .route('/sku/:version/:type(card)/:use(metaplex)/:code.:format')
            .get((req, res) => {
                this.handleImageRequest(req, res, 'sku');
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
