import {CertificateDTO} from "../certificates/services/certificates.service";

export abstract class ITemplate {

    /**
     * Function responsible for render the template according to the requirements of each brand
     * @param fromCertificate
     * @param use
     */
    abstract renderTemplate(fromCertificate: CertificateDTO, use: string): Promise<any>;

    //@ts-ignore
    wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }

        context.fillText(line, x, y);
    }

    // Ignore for now, the objective is to mimic the current page as is
    // @ts-ignore
    getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
}
