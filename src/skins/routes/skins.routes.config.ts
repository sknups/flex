import {CommonRoutesConfig} from "../../common/common.routes.config";
import express, {Application} from "express";
import {SkinsController} from "../controllers/skins.controller";

export class SkinsRoutesConfig extends CommonRoutesConfig {
    private static readonly ROUTE_NEEDLE = 'skins';

    private readonly skinsController: SkinsController;

    constructor(app: express.Application) {
        super(app, 'SkinRoutesConfig');

        this.skinsController = new SkinsController();
    }

    configureRoutes(): Application {
        this.getApp().route(
            `/${SkinsRoutesConfig.ROUTE_NEEDLE}/claim`
        ).get((req, res) => this.skinsController.claimForm(req, res))

        return this.getApp();
    }

}
