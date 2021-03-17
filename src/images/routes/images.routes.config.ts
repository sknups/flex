import {CommonRoutesConfig} from "../../common/common.routes.config";
import express from "express";
import {ImagesController} from "../controllers/images.controller";
import logger from "winston";

export class ImagesRoutesConfig extends CommonRoutesConfig {

    private readonly imagesController: ImagesController;

    constructor(app: express.Application) {
        super(app, 'Images Routes');

        this.imagesController = new ImagesController();
    }

    configureRoutes(): express.Application {
        // Root of Request
        this.getApp().route(`/img`)
            .get((req, res) => this.imagesController.index(req, res));

        this.getApp()
            .route('/img/:itemId/img/:imageType/**')
            .get((req, res) => this.handleImageRequest(req, res));

        this.getApp()
            .route('/img/3e9ed9a1ce/img/:imageType/**')
            .get((req, res) => this.handleImageRequest(req, res));

        return this.getApp();
    }

    /**
     * We might have multiple routes handling the image in the same way
     * @param request
     * @param response
     * @private
     */
    private handleImageRequest(request: express.Request, response: express.Response) {
        logger.info(`ImagesRoutesConfig.handleImageRequest from: ${request.params.itemId} with image: ${request.params.imageType}`);
        this.imagesController.getImage(request, response);
    }
}
