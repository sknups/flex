import { CommonRoutesConfig } from "../../common/common.routes.config";
import express from "express";
import { FlexController } from "../controllers/flex.controller";
import { logger } from '../../logger'

export class FlexRoutesConfig extends CommonRoutesConfig {

    private readonly flexController:  FlexController;

    constructor(app: express.Application) {
        super(app, 'Flex Routes');

        this.flexController = new FlexController();
    }

    configureRoutes(): express.Application {       

        this.getApp()
            .route('/flex/:version/:id.html')
            .get((req, res) => {                
                this.flexController.getPage(req, res).catch((err) => {
                    logger.error(`FlexRoutesConfig.getPage error: ${err}`);
                });
            });

        
        return this.getApp();
    }
}
