import express from "express";
import axios from 'axios';
import { StatusCodes } from "http-status-codes";
import { logger } from "../../logger";
import {
  ItemDTO,
  EntitiesService,
} from "../../entities/services/entities.service";

export class FlexController {
  private readonly entitiesService: EntitiesService;

  constructor() {
    this.entitiesService = new EntitiesService();
  }


  async getPage(request: express.Request, response: express.Response) {
    const type = request.params.type;
    const itemId = request.params.id;

    try {
      const dto = await this.getItem(itemId);
      const brandCode = dto.brandCode;
      const version = request.params.version;

      logger.info(
        `FlexController.getPage version: ${version} type: ${type} from brand: ${brandCode} with itemId: ${itemId}`
      );
 
      const gaMeasurementId = process.env.GA_MEASUREMENT_ID;
      const gaEnabled = gaMeasurementId && gaMeasurementId.length > 0;

      const gaLegacyMeasurementId = process.env.GA_LEGACY_MEASUREMENT_ID;
      const gaLegacyEnabled = gaEnabled && gaLegacyMeasurementId && gaLegacyMeasurementId.length > 0;

      const optimizeId = process.env.OPTIMIZE_ID;
      const optimizeEnabled = optimizeId && optimizeId.length > 0;
           
      const {sknappHost,flexHost,certVersion,thumbprint, stockKeepingUnitName, description } = dto;
      const {claimCode,stockKeepingUnitCode } = dto;
      
      response.status(StatusCodes.OK).render(`flex_${version}`, {
        optimizeId: optimizeId,
        optimizeEnabled: optimizeEnabled,
        gaEnabled: gaEnabled,
        gaMeasurementId: gaMeasurementId,
        gaLegacyEnabled: gaLegacyEnabled,
        gaLegacyMeasurementId: gaLegacyMeasurementId,
        thumbprint: thumbprint,
        claimCode: claimCode,
        brandCode: brandCode,        
        stockKeepingUnitCode: stockKeepingUnitCode,
        title: `${stockKeepingUnitName} - Sknups`,
        layout: false,
        appURL: `${sknappHost}/?utm_source=flex`,
        cardImgUrl: `${flexHost}/skn/${certVersion}/card/default/${thumbprint}.jpg`,
        cardThumbnailImgUrl: `${flexHost}/skn/${certVersion}/card/thumb/${thumbprint}.jpg?q=0.1`,
        backImgUrl: `${flexHost}/skn/${certVersion}/back/default/${thumbprint}.jpg`,        
        stockKeepingUnitName: stockKeepingUnitName,
        ogImageUrl: `${flexHost}/skn/${certVersion}/card/og/${thumbprint}.png`,
        ogUrl: `${flexHost}/flex/v1/${thumbprint}.html`,
        twitterImageUrl: `${flexHost}/skn/${certVersion}/card/og/${thumbprint}.png`,
        twitterUrl: `${flexHost}/flex/v1/${thumbprint}.html`,
        description : description,
        copyrightYear: new Date().getFullYear(),
        legalUrl: `${sknappHost}/skn/legal/use-sknapp`

      
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

  async getItem(withId: string): Promise<ItemDTO> {
    const response = await this.entitiesService.getItem(withId);
    return response.data;
  }
}
