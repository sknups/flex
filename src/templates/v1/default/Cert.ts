
import { BrandTemplate } from "../../BrandTemplate";
import { ImagesConfigs } from "../../../images/images.configs";
import { Canvas, createCanvas, Image, loadImage, registerFont } from "canvas";
import { logger } from '../../../logger'
import { CertificateDTO } from "../../../certificates/services/certificates.service";
import { Context } from "node:vm";

export class DefaultTemplate extends BrandTemplate<CertificateDTO> {

    WIDTH = 1080;
    HEIGHT = 1500; 
    
    CENTER_X = this.WIDTH / 2;        
    
    SPACE = 45;

    PRODUCT_IMG_WIDTH = 440;
    PRODUCT_IMG_HEIGHT = 575;
    PRODUCT_IMG_PADDING_TOP = 50;
    PRODUCT_IMG_X = this.CENTER_X - (this.PRODUCT_IMG_WIDTH / 2)

    BRAND_IMG_WIDTH = 835;
    BRAND_IMG_HEIGHT = 267;
    BRAND_IMG_PADDING_TOP = 26;
    BRAND_IMG_X = this.CENTER_X - (this.BRAND_IMG_WIDTH / 2)

    COLLECTABLE_DATA_WIDTH = 487;
    COLLECTABLE_DATA_HEIGHT = 175;
    COLLECTABLE_DATA_PADDING_TOP = 33;
    COLLECTABLE_DATA_X = this.CENTER_X - (this.COLLECTABLE_DATA_WIDTH / 2)

    PRODUCT_DESCRIPTION_WIDTH = 880;
    PRODUCT_DESCRIPTION_HEIGHT = 140;
    PRODUCT_DESCRIPTION_PADDING_TOP = 26;
    PRODUCT_DESCRIPTION__X = this.CENTER_X - (this.PRODUCT_DESCRIPTION_WIDTH / 2)


    //Useful to see outline of different bounding boxes
    DRAW_GUIDES = false;


    /**
     * Draws bounding boxes to show the different area's of
     * the certificate.
     * 
     * @param ctx 
     */
    drawGuides(ctx: Context) {       

        // Product Image 
        ctx.beginPath();
        ctx.rect(this.PRODUCT_IMG_X, this.PRODUCT_IMG_PADDING_TOP, this.PRODUCT_IMG_WIDTH, this.PRODUCT_IMG_HEIGHT);
        ctx.fillStyle = "rgba(249, 92, 233, 0.5)";
        ctx.fill(); 
        
        let y = this.PRODUCT_IMG_PADDING_TOP + this.PRODUCT_IMG_HEIGHT + this.COLLECTABLE_DATA_PADDING_TOP;

        // Collectable Data
        ctx.beginPath();
        ctx.rect(this.COLLECTABLE_DATA_X , y, this.COLLECTABLE_DATA_WIDTH, this.COLLECTABLE_DATA_HEIGHT);
        ctx.fillStyle = "rgba(249, 92, 233, 0.5)";
        ctx.fill();
        
        //Brand Logo
        y = y + this.COLLECTABLE_DATA_HEIGHT + this.BRAND_IMG_PADDING_TOP
        ctx.beginPath();
        ctx.rect(this.BRAND_IMG_X , y, this.BRAND_IMG_WIDTH, this.BRAND_IMG_HEIGHT);
        ctx.fillStyle = "rgba(249, 92, 233, 0.5)";
        ctx.fill();
        
        //Product Description
        y = y + this.BRAND_IMG_HEIGHT + this.PRODUCT_DESCRIPTION_PADDING_TOP;
        ctx.beginPath();
        ctx.rect(this.PRODUCT_DESCRIPTION__X , y, this.PRODUCT_DESCRIPTION_WIDTH, this.PRODUCT_DESCRIPTION_HEIGHT);
        ctx.fillStyle = "rgba(249, 92, 233, 0.5)";
        ctx.fill();

        //Center line
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(this.CENTER_X, 0);
        ctx.lineTo(this.CENTER_X,this.HEIGHT,);
        ctx.stroke();

    }

    async renderTemplate(fromCertificate: CertificateDTO, use: string): Promise<Canvas> {       
        let canvas = createCanvas(this.WIDTH, this.HEIGHT);

        // Load Fonts
        this.loadDefaultFontsIntoCanvas();

        const context = canvas.getContext('2d');
        context.patternQuality = 'good';
        context.quality = 'good';        

        //Load all required images in parallel before drawing them on the canvas
        let images = await this.loadImages([
            `./static/backgrounds/cert.front.default.${fromCertificate.certVersion}.jpg`,
            `sku.${fromCertificate.certVersion}.designImage.${fromCertificate.stockKeepingUnitCode}.png`,
            `brand.${fromCertificate.certVersion}.logo.${fromCertificate.brandCode}.png`,                        
        ]);
        //draw the images first
        const backgroundImage = images[0];
        if (backgroundImage.status == 'fulfilled') {
            context.drawImage(backgroundImage.value, 0, 0);
        } else {
            logger.info('Failed to load background image image:');
        }
        
        const skuImage = images[1];
        if (skuImage.status == 'fulfilled') {
            const imageDimensions = this.scaleToMax(this.PRODUCT_IMG_WIDTH, this.PRODUCT_IMG_HEIGHT, skuImage.value); 
            context.drawImage(skuImage.value, this.PRODUCT_IMG_X, this.PRODUCT_IMG_PADDING_TOP, imageDimensions[0], imageDimensions[1]);
        } else {
            logger.info('Failed to load sku image: ' + fromCertificate.stockKeepingUnitCode);
        }

        context.fillStyle = 'rgb(29,29,27)';
        context.font = '23pt ShareTechMono-Regular';
        let Y = this.PRODUCT_IMG_PADDING_TOP + this.PRODUCT_IMG_HEIGHT + this.COLLECTABLE_DATA_PADDING_TOP + 26;

        Y = Y + writeTextCentered(context, fromCertificate.stockKeepingUnitName.toLocaleUpperCase(), this.CENTER_X , Y);
        var qty = this.getItemNumberText(fromCertificate.maxQty, fromCertificate.saleQty, fromCertificate.stockKeepingUnitRarity);
        Y = Y + this.SPACE  
        Y = Y + writeTextCentered(context, 'ITEM ' + qty, this.CENTER_X, Y);
        Y = Y + this.SPACE +  15
        Y = Y + writeTextCentered(context, 'OWNERSHIP TOKEN: ', this.CENTER_X, Y);   
        Y = Y + this.SPACE
        Y = Y + writeTextCentered(context, fromCertificate.thumbprint, this.CENTER_X, Y);   
      
        const brandImage = images[2];
        if (brandImage.status == 'fulfilled') {
            Y = Y + this.BRAND_IMG_PADDING_TOP;
            const imageDimensions = this.scaleToMax(this.BRAND_IMG_WIDTH, this.BRAND_IMG_HEIGHT, brandImage.value);
            context.drawImage(brandImage.value,this.BRAND_IMG_X , Y, imageDimensions[0], imageDimensions[1]);
        } else {
            logger.info('Failed to load brand image: ' + fromCertificate.brandCode);
        }

        Y = Y + this.BRAND_IMG_HEIGHT + this.PRODUCT_DESCRIPTION_PADDING_TOP + 26;
        if (fromCertificate.description.length > 250) { context.font = '22pt Jost'; } else { context.font = '24pt Jost'; }
        this.wrapTextCentered(context, fromCertificate.description, this.CENTER_X, Y , this.PRODUCT_DESCRIPTION_WIDTH , 45);


        this.writeTestWatermark(context);
        
        if (this.DRAW_GUIDES) {
          this.drawGuides(context);
        }

        canvas = this.scale(canvas, 2);

        if (use == 'thumb') {
            canvas = this.convertToThumb(canvas);
        }       

        return canvas;

        function writeTextCentered(context: Context, text: String, x: number, y: number): number {
            return writeText(context, text, x, y, true);
        }

        function writeText(context: Context, text: String, x: number, y: number, center: boolean = false): number {
            let wrap = 0;
            const space = 32;
            const oldtextAlign = context.textAlign
            if (text.length > 25) {
                const words = text.split(' ');
                let line = '';
                for (let n = 0; n < words.length; n++) {
                    if (line.length + words[n].length > 25) {
                        if (center) {
                            context.textAlign = "center";  
                        }
                        context.fillText(line, x, y + wrap);
                        wrap = wrap + space;
                        line = words[n] + ' ';
                    } else {
                        line = line + words[n] + ' '
                    }
                }
                if (center) {
                  context.textAlign = "center";  
                }
                context.fillText(line, x, y + wrap);
            } else {
                if (center) {
                  context.textAlign = "center";  
                }
                context.fillText(text, x, y);
            }
            context.textAlign = oldtextAlign;
            return wrap;
        }
    }

    getItemNumberText(maxQty: number, saleQty: number, rarity: number) {
        return rarity > 1 ? saleQty + ' OF ' + maxQty : saleQty;
    }
}
