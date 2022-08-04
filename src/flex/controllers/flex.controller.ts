import express from "express";
import axios from 'axios';
import {StatusCodes} from "http-status-codes";
import {logger} from "../../logger";
import {EntitiesService} from "../../entities/services/entities.service";

export class FlexController {
  private readonly entitiesService: EntitiesService;

  constructor() {
    this.entitiesService = new EntitiesService();
  }


  async getPage(request: express.Request, response: express.Response) {
    const type = request.params.type;
    const itemId = request.params.id;

    try {
      const dto = await this.entitiesService.getItem(itemId);
      const brand = dto.brand;
      const version = request.params.version;

      logger.info(
        `FlexController.getPage version: ${version} type: ${type} from brand: ${brand} with itemId: ${itemId}`
      );

      const gaMeasurementId = process.env.GA_MEASUREMENT_ID;
      const gaEnabled = gaMeasurementId && gaMeasurementId.length > 0;

      const gaLegacyMeasurementId = process.env.GA_LEGACY_MEASUREMENT_ID;
      const gaLegacyEnabled = gaEnabled && gaLegacyMeasurementId && gaLegacyMeasurementId.length > 0;

      const optimizeId = process.env.OPTIMIZE_ID;
      const optimizeEnabled = optimizeId && optimizeId.length > 0;

      const {sknappHost,flexHost,token, name, description } = dto;
      const {giveaway,sku } = dto;

      response.status(StatusCodes.OK).render(`flex_${version}`, {
        optimizeId: optimizeId,
        optimizeEnabled: optimizeEnabled,
        gaEnabled: gaEnabled,
        gaMeasurementId: gaMeasurementId,
        gaLegacyEnabled: gaLegacyEnabled,
        gaLegacyMeasurementId: gaLegacyMeasurementId,
        token: token,
        giveaway: giveaway,
        brand: brand,
        sku: sku,
        title: `${name} | SKNUPS`,
        layout: false,
        appURL: `${sknappHost}/?utm_source=flex`,
        cardImgUrl: `${flexHost}/skn/v1/card/default/${token}.jpg`,
        cardThumbnailImgUrl: `${flexHost}/skn/v1/card/thumb/${token}.jpg?q=0.1`,
        backImgUrl: `${flexHost}/skn/v1/back/default/${token}.jpg`,
        name: name,
        ogImageUrl: `${flexHost}/skn/v1/card/og/${token}.png`,
        ogUrl: `${flexHost}/flex/v1/${token}.html`,
        twitterImageUrl: `${flexHost}/skn/v1/card/og/${token}.png`,
        twitterUrl: `${flexHost}/flex/v1/${token}.html`,
        description : description,
        copyrightYear: new Date().getFullYear(),
        legalUrl: `${sknappHost}/skn/legal/use-sknapp`,
        snapStickerImageUrl: `${flexHost}/skn/v1/card/snapsticker/${token}.png`
    });

    } catch (err) {

      if (axios.isAxiosError(err) && err.response && err.response.status === StatusCodes.NOT_FOUND) {
        response.writeHead(StatusCodes.NOT_FOUND);
        response.write("Failed to get flex page - Certificate not found");
        response.end();
        return;
      }
      logger.error(err);
      response.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
      response.write("Failed to get flex page");
      response.end();
    }
  }
}
