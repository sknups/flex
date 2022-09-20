import { CommonRoutesConfig } from "../../common/common.routes.config";
import express from "express";
import { FlexController } from "../controllers/flex.controller";

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
                this.flexController.redirectToSknapp(req, res);
            });

        
        return this.getApp();
    }
}
