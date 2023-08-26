import {IDBController} from "@/action-handlers/interfaces/IDBController";
import {ProductData, ProductResponseData, ProxyInfo, ResponseData} from "@/types/DataTypes";
import {ProductRequester} from "@/request-controllers/ProductRequester";
import {IProductRequestController} from "@/action-handlers/interfaces/IProductRequestController";
import {Configs} from "@/Configs";
import ResultCode from "@/types/ResultCode";
import {promiseWait} from "@/action-handlers/utils";

export class ProductActions {
    private productRequestController: IProductRequestController;

    constructor(private dbController: IDBController) {
        this.productRequestController = new ProductRequester();
    }

    async requestProducts(articles: number[]): Promise<ResponseData<ProductResponseData>> {
        try {
            const proxies = await this.dbController.proxy.getProxies();
            return (new ProductsProxyDistributor(this.productRequestController, articles, proxies))
                .distributeAndRequestProducts();
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
    private completedCount: number;
    private stepIndex: number;

    constructor(private productRequestController: IProductRequestController,
                private articles: number[], private proxies: ProxyInfo[]) {
        this.productsCount = articles.length;
        this.productsStep = Math.min(
            Math.ceil(this.productsCount / proxies.length),
            Configs.MAX_PROXY_REQUESTS_COUNT
        )
        this.maxStep = Math.ceil(this.productsCount / this.productsStep);
        this.stepIndex = 0;
        this.completedCount = 0;
        this.requestResult = [];
        console.log(this.productsCount, this.productsStep, this.maxStep)
    }

    async distributeAndRequestProducts(): Promise<ResponseData<ProductResponseData>> {
        await Promise.all(this.proxies.map((proxy) =>
            this.requestStepOfProducts(proxy, this.stepIndex++)
        ));
        return {code: ResultCode.OK, result: this.requestResult};
    }

    private async requestStepOfProducts(proxy: ProxyInfo, currentStep: number) {
        if (currentStep >= this.maxStep) return;
        console.log(`Proxy ${proxy.port} started with step ${currentStep}`);
        const response = await this.requestProducts(
            this.articles.slice(currentStep * this.productsStep, (currentStep + 1) * this.productsStep),
            proxy
        )

        const startInd = currentStep * this.productsStep;
        const endInd = Math.min(startInd + this.productsStep, this.productsCount);
        for (let i = startInd; i < endInd; i++) {
            this.requestResult[i] = response[i - startInd];
        }
        console.log(`Proxy ${proxy.port} ended with step ${currentStep}`);

        if (this.stepIndex >= this.maxStep) return;
        await promiseWait(Configs.PROXY_REQUEST_INTERVAL);
        await this.requestStepOfProducts(proxy, this.stepIndex++);
    }

    private async requestProducts(articles: number[], proxy?: ProxyInfo): Promise<ProductResponseData> {
        return Promise.all(articles.map((article) => this.requestProductWithTries(article, proxy)));
    }

    private async requestProductWithTries(article: number, proxy?: ProxyInfo): Promise<ResponseData<ProductData>> {
        for (let i = 0; i < Configs.PRODUCT_REQUEST_FAIL_TIMES; i++) {
            const response = await this.productRequestController.getProductByArticle(article, proxy);
            // TODO: rework for prod
            if (response.code !== ResultCode.TIMEOUT) return response;
            // else if (response.code !== ResultCode.TIMEOUT) return {code: ResultCode.FAIL};
        }
        return {code: ResultCode.TIMEOUT}
    }
}
