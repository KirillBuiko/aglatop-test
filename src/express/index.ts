import express from 'express';
import {productRequestRouter} from "@/express/routers/productRequestRouter";
import {IDBController} from "@/action-handlers/interfaces/IDBController";

export default function getExpress(dbController: IDBController){
    const ex = express()

    // ex.use(cors({
    //     origin: Configs.ORIGIN,
    //     optionsSuccessStatus: 200,
    //     credentials: true
    // }))

// MIDDLEWARES
    ex.use(express.json())

// ROUTERS
    ex.use(productRequestRouter(dbController));

    return ex;
}