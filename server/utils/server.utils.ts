import * as http from "http";
import * as express from "express";

export class ServerUtils {

    /**
     * Normalize a port into a number, string, or false.
     * @return number | string | boolean
     */
    static normalizePort(withValue: string): number | string {
        const port = parseInt(withValue, 10);

        if (isNaN(port)) {
            // named pipe
            return withValue;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return 0;
    }

    /**
     * Create a server from a given express application
     * @param fromApp
     */
    static createServer(fromApp: express.Application): http.Server {
        return http.createServer(fromApp);
    }
}
