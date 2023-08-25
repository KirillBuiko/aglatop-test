import {IDBController} from "@/action-handlers/interfaces/IDBController";
import {ProductData, ProductResponseData, ProxyInfo, ResponseData} from "@/types/DataTypes";
import {ProductRequestController} from "@/request-controllers/ProductRequestController";
import {IProductRequestController} from "@/action-handlers/interfaces/IProductRequestController";
import {Configs} from "@/Configs";
import ResultCode from "@/types/ResultCode";

export class ProductActions {
    productRequestController: IProductRequestController;

    constructor(private dbController: IDBController) {
        this.productRequestController = new ProductRequestController();
    }

    async requestProducts(articles: number[]): Promise<ResponseData<ProductResponseData>> {
        try {
            const proxies = await this.dbController.proxy.getProxies();
            return (new ProductsProxyDistributor(this.productRequestController, articles, proxies)).makeRequest();
        } catch {
            return {code: ResultCode.FAIL}
        }
    }
}

class ProductsProxyDistributor {
    private readonly productsCount: number;
    private readonly productsStep: number;
    private readonly maxStep: number;
    private readonly requestResult: ResponseData<ProductData>[];
    private requestResolveFunction;
    private completedCount: number;
    private stepCount: number;

    constructor(private productRequestController: IProductRequestController,
                private articles: number[], private proxies: ProxyInfo[]) {
        this.productsCount = articles.length;
        this.productsStep = Math.min(
            Math.ceil(this.productsCount / proxies.length),
            Configs.MAX_PROXY_REQUESTS_COUNT
        )
        this.maxStep = Math.ceil(this.productsCount / this.productsStep);
        this.stepCount = 0;
        this.completedCount = 0;
        this.requestResult = [];
    }

    async makeRequest(): Promise<ResponseData<ProductResponseData>> {
        const promise = new Promise<ResponseData<ProductResponseData>>(
            (resolve) => this.requestResolveFunction = resolve);
        this.proxies.some((proxy) => {
            this.requestProductsProxyPromise(proxy, this.stepCount);
        })
        return promise;
    }

    private async requestProductsProxyPromise(proxy: ProxyInfo, currentStep: number) {
        if (this.stepCount >= this.maxStep) return;
        this.stepCount++;
        this.requestProducts(
            this.articles.slice(this.stepCount * this.productsStep, (this.stepCount + 1) * this.productsStep),
            proxy
        ).then((resp) => this.requestProductsProxyPromiseCallback(proxy, resp, currentStep));
    }

    private async requestProductsProxyPromiseCallback(proxy: ProxyInfo, response: ResponseData<ProductData>[],
                                                      currentStep: number) {
        const a = currentStep * this.productsStep;
        const b = a + this.productsStep;
        for (let i = a; i < b; i++) {
            this.requestResult[i] = response[i - a];
        }
        this.completedCount++;
        if (this.completedCount === this.maxStep) this.requestResolveFunction(this.requestResult);
        setTimeout(() => {
            this.requestProductsProxyPromise(proxy, this.stepCount);
        }, Configs.PROXY_REQUEST_INTERVAL);
    }

    private async requestProducts(articles: number[], proxy?: ProxyInfo): Promise<ProductResponseData> {
        return Promise.all(articles.map((article) => this.requestProduct(article, proxy)));
    }

    private async requestProduct(article: number, proxy?: ProxyInfo): Promise<ResponseData<ProductData>> {
        for (let i = 0; i < Configs.PRODUCT_REQUEST_FAIL_TIMES; i++) {
            const response = await this.productRequestController.getProductByArticle(article, proxy);
            // TODO: rework for prod
            if (response.code !== ResultCode.TIMEOUT) return response;
            // else if (response.code !== ResultCode.TIMEOUT) return {code: ResultCode.FAIL};
        }
        return {code: ResultCode.TIMEOUT}
    }
}
