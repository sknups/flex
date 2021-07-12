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
            .route('/img/cert/:version/:purpose/:certCode.png')
            .get((req, res) => this.handleCertImageRequest(req, res));

        this.getApp()
            .route('/img/cert/:certCode')
            .get((req, res) => this.handleCertImageRequest(req, res));

        this.getApp()
            .route('/img/card/:version/:purpose/:certCode.png')
            .get((req, res) => this.handleCardImageRequest(req, res));

        this.getApp()
            .route('/img/back/:version/:purpose/:certCode.png')
            .get((req, res) => this.handleBackImageRequest(req, res));

        this.getApp()
            .route('/img/sku/:version/:purpose/:skuCode.:extension(png|glb)')
            .get((req, res) => this.handleSkuImageRequest(req, res, false));

        this.getApp()
            .route('/img/sku/:skuCode')
            .get((req, res) => this.handleSkuImageRequest(req, res, true));

        this.getApp()
            .route('/img/claim/:version/:purpose/:claimCode.:extension(png|jpg)')
            .get((req, res) => this.handleClaimBackgroundRequest(req, res, false));

        this.getApp()
            .route('/img/claim/:claimCode')
            .get((req, res) => this.handleClaimBackgroundRequest(req, res, true));

        return this.getApp();
    }

    /**
     * We might have multiple routes handling the image in the same way
     * @param request
     * @param response
     * @private
     */
    private handleCertImageRequest(request: express.Request, response: express.Response) {
        logger.info(`ImagesRoutesConfig.handleImageRequest for: ${JSON.stringify(request.params)}`);
        this.imagesController.getImage("cert", request, response).then(() => {
            logger.info(`imagesController.getCertImage success`);
        }).catch((err) => {
            logger.info(`imagesController.getCertImage error: ${err}`);
        });
    }

    private handleCardImageRequest(request: express.Request, response: express.Response) {
        logger.info(`ImagesRoutesConfig.handleImageRequest for: ${JSON.stringify(request.params)}`);
        this.imagesController.getImage("card", request, response).then(() => {
            logger.info(`imagesController.getCertImage success`);
        }).catch((err) => {
            logger.info(`imagesController.getCertImage error: ${err}`);
        });
    }

    private handleBackImageRequest(request: express.Request, response: express.Response) {
        logger.info(`ImagesRoutesConfig.handleImageRequest for: ${JSON.stringify(request.params)}`);
        this.imagesController.getImage("back", request, response).then(() => {
            logger.info(`imagesController.getCertImage success`);
        }).catch((err) => {
            logger.info(`imagesController.getCertImage error: ${err}`);
        });
    }


    private handleSkuImageRequest(request: express.Request, response: express.Response, fallback: boolean) {
        logger.info(`ImagesRoutesConfig.handleSkuImageRequest for: ${JSON.stringify(request.params)}`);
        this.imagesController.getSkuImage(request, response, fallback).then(() => {
            logger.info(`imagesController.getSkuImage success`);
        }).catch((err) => {
            logger.info(`imagesController.getSkuImage error: ${err}`);
        });
    }

    private handleClaimBackgroundRequest(request: express.Request, response: express.Response, fallback: boolean) {
        logger.info(`ImagesRoutesConfig.handleClaimBackgroundRequest for: ${JSON.stringify(request.params)}`);
        this.imagesController.getClaimBackground(request, response, fallback).then(() => {
            logger.info(`imagesController.getClaimBackground success`);
        }).catch((err) => {
            logger.info(`imagesController.getClaimBackground error: ${err}`);
        });
    }
}
