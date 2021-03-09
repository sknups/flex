import {CertificatesService} from "../services/certificates.service";
import {Request, Response} from "express";
import {AxiosError} from 'axios';
import {StatusCodes} from "http-status-codes";
import logger from "winston";
import {ImagesConfigs} from "../../images/images.configs";

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

                res.status(StatusCodes.OK).render('legacy-cert', {
                    title: 'Certificate',
                    data: response.data,
                    jsonString: JSON.stringify(response.data),
                    host: req.protocol + '://' + req.hostname,
                    width: ImagesConfigs.SIZES.default, 'height': 380
                });
            })
            .catch((error: AxiosError) => {
                logger.error(`CertificateController.certificate.catch response:${error}`);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
            })
    }
}
