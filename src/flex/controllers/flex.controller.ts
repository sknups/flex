import express from "express";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../logger";

export class FlexController {

  async redirectToSknapp(request: express.Request, response: express.Response) {
    const itemId = request.params.id;
    const sknappHost = process.env.SKNAPP_HOST || 'http://localhost:4200'
    const sknappItemPage = `${sknappHost}/item/${itemId}`
    logger.info(`Redirecting to ${sknappItemPage}`)
    response.redirect(StatusCodes.PERMANENT_REDIRECT, sknappItemPage)
  }
}
