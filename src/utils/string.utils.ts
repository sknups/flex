export class StringUtils {

    /**
     * Transform a string to camel case
     * @param str
     */
    static camelize(str: string): string {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    /**
     * Capitalize the first letter
     * @param str
     */
    static capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * A wrapper for camelize and capitalize
     * User for the Dynamic init classes for brands.
     *
     * Eg: BrandCode ios DSX => Dsx
     *
     * @param str
     */
    static classify(str: string): string {
        return this.capitalize(this.camelize(str));
    }
}
