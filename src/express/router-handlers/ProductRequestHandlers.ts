import {NextFunction, Response, Router} from "express";
import {ResponseData} from "@/types/DataTypes";
import ResultCode from "@/types/ResultCode";
import {IDBController} from "@/action-handlers/interfaces/IDBController";
import {ProductActions} from "@/action-handlers/ProductActions";

export class ProductRequestHandlers {
    productActions: ProductActions;

    constructor(dbController: IDBController) {
        this.productActions = new ProductActions(dbController);
    }

    initRouter(router: Router) {
        router.get('/get-5000-products', [
            this.get5000Products.bind(this)])
    }

    private async get5000Products(req, res, _){
        const response = await this.productActions.requestProducts(
            Array(10).fill(1).map((v,i) => i));
        this.expressRequestResultHandler(response, res);
    }

    private expressRequestResultHandler<T, R>(response: ResponseData<T>, res: Response,
                                              preSendCallback?: (result: T) => void, next?: NextFunction) {
        if (response.code != ResultCode.OK) {
            res.json({code: response.code});
            return;
        }
        if (preSendCallback)
            preSendCallback(response.result);
        next ? next() : res.json(response);
    }
}