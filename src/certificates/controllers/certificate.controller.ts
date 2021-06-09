import {CertificatesService, ProblemErrorResponse} from "../services/certificates.service";
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

        this.certificateService.getCertificate(req.params.id, req.query.email)
            .then((response) => {
                logger.info(`CertificateController.certificate.then response:${JSON.stringify(response.data)}`);

                const toast = req.query.redirect ?
                    'Congratulations on your new Skin! Check your email for details.': '';

                let host = `${req.protocol}://${req.hostname}`

                if (!response.data.cardImgUrl){
                    response.data.cardImgUrl = response.data.certImgUrl.replace('cert', 'card');
                    response.data.backImgUrl = response.data.certImgUrl.replace('cert', 'back');
                    logger.error(response.data.cardImgUrl);
                    logger.info("Deducing cardImgUrl and backImgUrl as not set");
                }

                if (req.hostname == 'localhost') {
                    host = `${host}:3000`
                    response.data.certImgUrl = response.data.certImgUrl.replace('https://flex-dev.sknups.gg', host);
                    response.data.cardImgUrl = response.data.certImgUrl.replace('https://flex-dev.sknups.gg', host);
                    response.data.backImgUrl = response.data.certImgUrl.replace('https://flex-dev.sknups.gg', host);
                    logger.warn("Editing img URL to localhost");
                }

                res.status(StatusCodes.OK).render('certificate', {
                    title: 'Certificate',
                    data: response.data,
                    cardImgUrl: response.data.certImgUrl.replace('cert', 'card'),
                    backImgUrl: response.data.certImgUrl.replace('cert', 'back'),
                    toast,
                    showToast: req.query.redirect ? 'visible' : 'no-opacity',
                    showCTA: response.data.isOwner,
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

    /**
     * Assign a certificate and reveal page with a flashy box
     * @param req
     * @param res
     */
    assign(req: Request, res: Response) {
        logger.info(`CertificateController.assign`);

        this.certificateService.assignCertificate(req.query.certCode, req.query.email)
            .then((response) => {
                logger.info(`CertificateController.assign.then response:${JSON.stringify(response.data)}`);

                let host = `${req.protocol}://${req.hostname}`

                res.status(StatusCodes.OK).render('boxed', {
                    title: 'Boxed',
                    certCode: req.query.certCode,
                    email: req.query.email,
                    host: req.hostname,
                    jsonString: JSON.stringify(response.data),
                    width: ImagesConfigs.SIZES.DEFAULT * ImagesConfigs.SIZES.SCALE,
                    layout: 'certificate',
                    certificateHostPath: CertificatesRoutesConfig.ROUTE_NEEDLE
                });
            })
            .catch((error: AxiosError<ProblemErrorResponse>) => {
                logger.error('--------------------------------');
                logger.error(`CertificateController.assign.catch response:${error} and data: ${JSON.stringify(error.response?.data || {})}`);
                const statusCode = error.response?.status || 500;
                if (statusCode === StatusCodes.CONFLICT) {
                    logger.error('--------------------------------CONFLICT--------------------------------');
                    logger.error(error.response?.data?.status);
                    logger.error(error.response?.data?.detail);
                    // @ts-ignore
                    logger.error(JSON.parse(error.response.data.detail));
                    // @ts-ignore
                    logger.error(JSON.parse(error.response.data.detail).assignmentResponseCode);
                    // @ts-ignore
                    if (JSON.parse(error.response.data.detail).assignmentResponseCode === 'ALREADY_ASSIGNED') {
                        logger.error('--------------------------------ALREADY_ASSIGNED--------------------------------');
                        const toast = 'The skin is already yours. Time to unbox!';
                        res.status(StatusCodes.OK).render('boxed', {
                            title: 'Boxed',
                            certCode: req.query.certCode,
                            toast,
                            showToast: 'visible',
                            email: req.query.email,
                            host: req.hostname,
                            jsonString: JSON.stringify(error.response?.data),
                            width: ImagesConfigs.SIZES.DEFAULT * ImagesConfigs.SIZES.SCALE,
                            layout: 'certificate',
                            certificateHostPath: CertificatesRoutesConfig.ROUTE_NEEDLE
                        });
                    // @ts-ignore
                    } else if (JSON.parse(error.response.data.detail).assignmentResponseCode === 'ALREADY_OWNED') {
                        logger.error('--------------------------------ALREADY_OWNED--------------------------------');
                        this.certificateService.getCertificate(req.query.certCode, req.query.email)
                            .then((response) => {
                                logger.info(`CertificateController.certificate.then response:${JSON.stringify(response.data)}`);

                                const toast = req.query.redirect ?
                                    'Congratulations on your new Skin! Check your email for details.': '';

                                let host = `${req.protocol}://${req.hostname}`

                                if (req.hostname == 'localhost') {
                                    host = `${host}:3000`
                                }

                                res.status(StatusCodes.OK).render('certificate', {
                                    title: 'Certificate',
                                    data: response.data,
                                    toast,
                                    showToast: req.query.redirect ? 'visible' : 'no-opacity',
                                    showCTA: response.data.isOwner,
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
                    logger.error('--------------------------------STUCK--------------------------------');
                } else {
                    res.status(statusCode).render(statusCode.toString(10), {
                        layout: 'missing-certificate', id: req.query.certCode,
                        toast: 'Something went wrong. Please try again later.',
                    });
                }
            })
    }

    /**
     * Activate a certificate and reveal page with a flashy unboxing
     * @param req
     * @param res
     */
    activate(req: Request, res: Response) {
        logger.info(`CertificateController.activate`);

        this.certificateService.activateCertificate(req.query.certCode, req.query.email)
            .then((response) => {
                logger.info(`CertificateController.activate.then response:${JSON.stringify(response.data)}`);

                let host = `${req.protocol}://${req.hostname}`

                res.status(StatusCodes.OK).render('unboxed', {
                    title: 'Unboxing',
                    certCode: req.query.certCode,
                    email: req.query.email,
                    host: req.hostname,
                    jsonString: JSON.stringify(response.data),
                    width: ImagesConfigs.SIZES.DEFAULT * ImagesConfigs.SIZES.SCALE,
                    layout: 'certificate',
                    certificateHostPath: CertificatesRoutesConfig.ROUTE_NEEDLE
                });
            })
            .catch((error: AxiosError) => {
                logger.error(`CertificateController.activate.catch response:${error} and data: ${JSON.stringify(error.response?.data || {})}`);
                const statusCode = error.response?.status || 500;

                res.status(statusCode).render(statusCode.toString(10), {
                    layout: 'missing-certificate', id: req.query.certCode,
                    toast: 'Something went wrong. Please try again later.',
                });
            })
    }
}
