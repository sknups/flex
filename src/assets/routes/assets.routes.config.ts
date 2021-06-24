import {CommonRoutesConfig} from "../../common/common.routes.config";
import express from "express";
import {logger } from '../../logger'
import {AssetsController} from "../controllers/assets.controller";

export class AssetsRoutesConfig extends CommonRoutesConfig {

    private readonly assetsController: AssetsController;

    constructor(app: express.Application) {
        super(app, 'Assets Routes');

        this.assetsController = new AssetsController();
    }

    configureRoutes(): express.Application {
        // Root of Request
        this.getApp().route(`/assets`)
            .get((req, res) => this.assetsController.index(req, res));

        this.getApp()
            .route('/assets/claim/:version/:purpose/:claimCode.:extension(mp4)')
            .get((req, res) => this.handleClaimWinnerAnimationRequest(req, res, false));

        this.getApp()
            .route('/assets/claim/winner/:claimCode')
            .get((req, res) => this.handleClaimWinnerAnimationRequest(req, res, true));

        return this.getApp();
    }

    private handleClaimWinnerAnimationRequest(request: express.Request, response: express.Response, fallback: boolean) {
        logger.info(`AssetsRoutesConfig.handleClaimWinnerAnimationRequest for: ${JSON.stringify(request.params)}`);
        this.assetsController.getClaimWinnerAnimation(request, response, fallback).then(() => {
            logger.info(`assetsController.getClaimWinnerAnimation success`);
        }).catch((err) => {
            logger.info(`assetsController.getClaimWinnerAnimation error: ${err}`);
        });
    }
}
