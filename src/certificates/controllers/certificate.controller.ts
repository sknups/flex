import {CertificatesService} from "../services/certificates.service";
import {Request, Response} from "express";
import {AxiosError} from 'axios';
import {StatusCodes} from "http-status-codes";

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
        this.certificateService.getCertificate(req.params.id)
            .then((response) => {
                res.status(StatusCodes.OK).send(response.data);
            })
            .catch((error: AxiosError) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
            })
    }
}
