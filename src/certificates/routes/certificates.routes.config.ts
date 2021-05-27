import {CommonRoutesConfig} from "../../common/common.routes.config";
import {Application} from "express";
import {CertificateController} from "../controllers/certificate.controller";

export class CertificatesRoutesConfig extends CommonRoutesConfig {

    static readonly ROUTE_NEEDLE = 'cert';
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

        // Get a certificate with ID or ID + more stuff (any stuff)
        this.getApp()
            .route([
                    `/${CertificatesRoutesConfig.ROUTE_NEEDLE}/:id`,
                    `/${CertificatesRoutesConfig.ROUTE_NEEDLE}/:id/**`
                ]
            )
            .get((req, res, next) => this.certificateController.certificate(req, res));

        // Activate a certificate with ID or ID + more stuff (any stuff)
        this.getApp()
            .route([
                    `/activate?cert=:certCode&email=:email`,
                    `/activate?cert=:certCode&email=:email/**`
                ]
            )
            .get((req, res, next) => this.certificateController.activate(req, res));

        return this.getApp();
    }
}
