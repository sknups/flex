import {CertificatesService} from "../services/certificates.service";
import {Request, Response} from "express";
import {AxiosError} from 'axios';
import {StatusCodes} from "http-status-codes";
import logger from "winston";
import {ImagesConfigs} from "../../images/images.configs";
import {CertificatesRoutesConfig} from "../routes/certificates.routes.config";

export class CertificateController {
    private readonly certificateService: CertificatesService;


    constructor() {
        this.certificateService = new CertificatesService();
    }

    index(req: Request, res: Response) {
        res.render('index', {title: 'Certificates', message: 'Welcome to Certificates'});
    }

    /**
     * Get details from a certificate and present to the user the content we need
     * @param req
     * @param res
     */
    certificate(req: Request, res: Response) {
        logger.info(`CertificateController.certificate`);

        this.certificateService.getCertificate(req.params.id)
            .then((response) => {
                logger.info(`CertificateController.certificate.then response:${JSON.stringify(response.data)}`);

                const toast = req.query.redirect ? 'Congratulations on your new Skin! Check your email for details.'
                    : req.query.active ? 'Your skin is already activated. Time to flex!' : '';                    


                let host = `${req.protocol}://${req.hostname}`

                if (req.hostname == 'localhost') {
                    host = `${host}:3000`
                }

                res.status(StatusCodes.OK).render('certificate', {
                    title: 'Certificate',
                    data: response.data,
                    toast,
                    showToast: req.query.redirect || req.query.active ? 'visible' : 'no-opacity',
                    jsonString: JSON.stringify(response.data),
                    host: host,
                    width: ImagesConfigs.SIZES.DEFAULT * ImagesConfigs.SIZES.SCALE,
                    layout: 'certificate',
                    certificateHostPath: CertificatesRoutesConfig.ROUTE_NEEDLE
                });
            })
            .catch((error: AxiosError) => {
                logger.error(`CertificateController.certificate.catch response:${error} and data: ${JSON.stringify(error.response?.data || {})}`);
                const statusCode = error.response?.status || 500;

                res.status(statusCode).render(statusCode.toString(10), {
                    layout: 'missing-certificate', id: req.params.id,
                    toast: 'Something went wrong. Please try again later.',
                });
            })
    }
}
