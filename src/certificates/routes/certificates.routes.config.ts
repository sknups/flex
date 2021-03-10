import {CommonRoutesConfig} from "../../common/common.routes.config";
import {Application} from "express";
import {CertificateController} from "../controllers/certificate.controller";

export class CertificatesRoutesConfig extends CommonRoutesConfig {

    private static readonly ROUTE_NEEDLE = 'certificate';
    private readonly certificateController: CertificateController;

    constructor(app: Application) {
        super(app, 'CertificatesRoutesConfig');

        // Init the certificate controller
        this.certificateController = new CertificateController();
    }

    configureRoutes(): Application {
        // Root of Request
        this.getApp().route(`/${CertificatesRoutesConfig.ROUTE_NEEDLE}`)
            .get((req, res) => this.certificateController.index(req, res))

        // Get a certificate with ID
        this.getApp()
            .route(`/${CertificatesRoutesConfig.ROUTE_NEEDLE}/:id`)
            .get((req, res, next) => this.certificateController.certificate(req, res));

        return this.getApp();
    }
}
