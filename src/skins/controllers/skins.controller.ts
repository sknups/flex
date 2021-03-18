import {Request, Response} from "express";
import logger from "winston";
import {StatusCodes} from "http-status-codes";

export class SkinsController {
    /**
     * This will be responsible to return to the user the claim form
     * @param req
     * @param res
     */
    claimForm(req: Request, res: Response) {
        logger.info(`SkinsController.claimForm`);
        res.status(StatusCodes.OK).render('claim');
    }
}
