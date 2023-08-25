import express, {Router} from "express";
import {ProductRequestHandlers} from "@/express/router-handlers/ProductRequestHandlers";
import {IDBController} from "@/action-handlers/interfaces/IDBController";

export function productRequestRouter (dbController: IDBController): Router {
    const router = express.Router();
    (new ProductRequestHandlers(dbController)).initRouter(router);
    return router;
}