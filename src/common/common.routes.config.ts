import express from 'express';
export abstract class CommonRoutesConfig {
    protected readonly app: express.Application;
    protected readonly name: string;

    protected constructor(app: express.Application, name: string) {
        this.app = app;
        this.name = name;
        this.configureRoutes();
    }

    /**
     * Get Routes Config Name
     */
    getName() {
        return this.name;
    }

    getApp() {
        return this.app;
    }

    /**
     * Configure Routes
     */
    abstract configureRoutes(): express.Application;
}
