import {logger } from '../../logger'
import { Storage } from "@google-cloud/storage";
import { Canvas, Image, loadImage } from "canvas";
import {Template} from "../model";
import {SkuDTO} from "../../entities/services/sku.service";
import {ItemDTO} from "../../entities/services/item.service";

export class ImagesService {

    private readonly bucket;

    constructor() {
      switch (process.env.ENVIRONMENT) {
            case null || undefined:
                logger.warn("Warn - no env var ENVIRONMENT - defaulting to DEV");
                this.bucket = new Storage().bucket('assets-dev.sknups.com');
                break;
            case 'prd':
                this.bucket = new Storage().bucket('assets.sknups.com');
                break;
            default:
                this.bucket = new Storage().bucket(`assets-${process.env.ENVIRONMENT}.sknups.com`);
                break;
        }
    }

    private static capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }


    // This will return a promise wrapping a canvas on which the image is drawn,  The code to draw the canvas is selected according to the parameters passed.
    async generateCanvasImage(version: string, template: Template, use: string, dto: SkuDTO | ItemDTO, index?: string): Promise<Canvas> {

        const className = ImagesService.capitalize(template);

            try {
                const defaultTemplateModule = await import(`../../templates/${version}/default/${className}`);
                const templateController = new defaultTemplateModule.DefaultTemplate(this);
                return templateController.renderTemplate(dto, use, index);
            } catch (error) {
                logger.error(`ImagesService.generateCanvasImage failed to load ../../templates/${version}/default/${className}: ${error}`);
                throw new Error(`Failed to load ../../templates/${className}/default/DefaultTemplate`);
            }

    }
    async getBucketImage(name: string): Promise<Buffer> {
        const getRawBody = require('raw-body');
        const file = this.bucket.file(name);
        return getRawBody(file.createReadStream());
    }

    /**
     * Will load any image whose name includes 'static' from the filesystem, and all others from the asset bucket
     * @param name The name or path of the file to load
     */
    async getCanvasImage(name: string): Promise<Image> {
        if (name.includes('static')) {
            return loadImage(name);
        } else {
            try {
                let res = await this.getBucketImage(name);
                return loadImage(res);
            } catch (err) {
                logger.error(`ImagesService.getCanvasImage name ="${name}" error="${err}"`);
                return new Promise<Image>((resolve, reject) => {
                    reject();
                });
            }
        }
    }
}
