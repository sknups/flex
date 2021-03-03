import {CommonRoutesConfig} from "../../common/common.routes.config";
import {Application, Request, Response} from "express";

export class CertificatesRoutesConfig extends CommonRoutesConfig {

    private static readonly ROUTE_NEEDLE = 'certificate';

    constructor(app: Application) {
        super(app, 'CertificatesRoutesConfig');
    }

    configureRoutes(): Application {
        this.getApp().route(`/${CertificatesRoutesConfig.ROUTE_NEEDLE}`)
            .get((req: Request, res: Response) => {
                res.status(200).send({message: `Get from ${this.getName()}`});
            });

        this.getApp().route(`/${CertificatesRoutesConfig.ROUTE_NEEDLE}/:id`)
            .get((req: Request, res: Response) => {
                res.status(200).send(`Get from ${this.getName()} with :id=${req.params.id}`);
            });

        return this.getApp();
    }
}
