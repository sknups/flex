import express from "express";
import {StatusCodes} from "http-status-codes";
import {logger } from '../../logger'
import {AssetsService} from "../services/assets.service";

export class AssetsController {

    private readonly assetsService: AssetsService;

    constructor() {
        this.assetsService = new AssetsService();
    }

    index(request: express.Request, response: express.Response) {

        logger.info(`AssetsController.index`);

        response.status(StatusCodes.OK).render('index', {
            title: 'AssetsController',
            message: 'Hello World from AssetsController'
        });
    }

    stripExtension(value: string): string {
        const idx = value.indexOf(".mp4");
        return idx < 0 ? value : value.substr(0, idx); //stripping .png extension, if exists
    }

    async getClaimWinnerAnimation(request: express.Request, response: express.Response, fallback: boolean) {
        logger.info(`AssetsController.getClaimWinnerAnimation`);

        try {
            const claimCode = this.stripExtension(request.params.claimCode);
            const version = fallback ? 'v1' : request.params.version;
            const purpose = fallback ? 'winner' : request.params.purpose;
            const extension = fallback ? 'mp4' : request.params.extension;

            logger.info(`ClaimCode: ${claimCode}`);

            this.assetsService.getClaimWinnerAnimation(claimCode, version, purpose, extension)
                .then((buffer) => {
                    logger.info(`AssetsController.getClaimWinnerAnimation with buffer.length=${buffer.length}`);

                    response.writeHead(StatusCodes.OK, {
                        'Content-Type': 'video/' + extension,
                        'Content-Length': buffer.length
                    });
                    response.write(buffer);
                    response.end(null, 'binary');
                })
                .catch((err) => {
                    logger.error(`AssetsController.getClaimWinnerAnimation ERROR. ${err}`);

                    response.writeHead(StatusCodes.NOT_FOUND);
                    response.write('Failed to load video');
                    response.end();
                });
        } catch (err) {
            logger.info(`AssetsController.getClaimWinnerAnimation ERROR. Failed to get`);
            this.handleAssetError(response, err);
        }
    }


    handleAssetError(response: express.Response, err: any) {
        response.writeHead(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
    }
}
