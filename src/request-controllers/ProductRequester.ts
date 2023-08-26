import {IRequestController} from "@/action-handlers/interfaces/IRequestController";
import {Configs} from "@/Configs";
import AxiosRequestController from "@/request-controllers/AxiosRequestController";
import {ProductData, ProxyInfo} from "@/types/DataTypes";
import {IProductRequestController} from "@/action-handlers/interfaces/IProductRequestController";

export class ProductRequester implements IProductRequestController {
    requestController: IRequestController;
    BASE_URL = "https://kaspi.kz"

    constructor() {
        this.requestController = new AxiosRequestController(this.BASE_URL);
    }

    getProductByArticle(article: number, proxy?: ProxyInfo) {
        return this.requestController.makeRequest<ProductData>({
            url: "/yml/offer-view/offers/" + article,
            proxy: proxy,
            options: {
                timeout: Configs.PRODUCT_REQUEST_TIMEOUT
            },
        })
    }
}