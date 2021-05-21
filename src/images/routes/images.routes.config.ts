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
            .route('/img/cert/:version/:purpose/:certCode.png')
            .get((req, res) => this.handleCertImageRequest(req, res));

        this.getApp()
            .route('/img/cert/:certCode')
            .get((req, res) => this.handleCertImageRequest(req, res));

        this.getApp()
            .route('/img/sku/:version/:purpose/:skuCode.:extension(png|glb)')
            .get((req, res) => this.handleSkuImageRequest(req, res, false));

        this.getApp()
            .route('/img/sku/:skuCode')
            .get((req, res) => this.handleSkuImageRequest(req, res, true));

        return this.getApp();
    }

    /**
     * We might have multiple routes handling the image in the same way
     * @param request
     * @param response
     * @private
     */
    private handleCertImageRequest(request: express.Request, response: express.Response) {
        logger.info(`ImagesRoutesConfig.handleImageRequest for: ${request.params}`);
        this.imagesController.getCertImage(request, response).then(() => {
            logger.info(`imagesController.getCertImage success`);
        }).catch((err) => {
            logger.info(`imagesController.getCertImage error: ${err}`);
        });
    }

    private handleSkuImageRequest(request: express.Request, response: express.Response, fallback: boolean) {
        logger.info(`ImagesRoutesConfig.handleSkuImageRequest for: ${request.params}`);
        this.imagesController.getSkuImage(request, response, fallback).then(() => {
            logger.info(`imagesController.getSkuImage success`);
        }).catch((err) => {
            logger.info(`imagesController.getSkuImage error: ${err}`);
        });
    }
}
