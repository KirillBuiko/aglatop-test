import {IDBController} from "@/action-handlers/interfaces/IDBController";
import {ProductData, ProductResponseData, ProxyInfo, ResponseData} from "@/types/DataTypes";
import {ProductRequester} from "@/request-controllers/ProductRequester";
import {IProductRequestController} from "@/action-handlers/interfaces/IProductRequestController";
import {Configs} from "@/Configs";
import ResultCode from "@/types/ResultCode";

export class ProductActions {
    private productRequestController: IProductRequestController;

    constructor(private dbController: IDBController) {
        this.productRequestController = new ProductRequester();
    }

    async requestProducts(articles: number[]): Promise<ResponseData<ProductResponseData>> {
        try {
            const proxies = await this.dbController.proxy.getProxies();
            return (new ProductsProxyDistributor(this.productRequestController, articles, proxies))
                .requestProducts();
        } catch {
            return {code: ResultCode.FAIL}
        }
    }
}

type ProxyTasksInfo = {
    proxy: ProxyInfo,
    tasksInWork: number
};

class ProductsProxyDistributor {
    private readonly productsCount: number;
    private readonly requestResult: ProductResponseData;
    private readonly proxiesInfo: ProxyTasksInfo[];
    private resolveFunction: (value: ResponseData<ProductResponseData> | PromiseLike<ResponseData<ProductResponseData>>) => void;
    private timerHandler: NodeJS.Timeout;
    private articleQueueIndex: number;
    private completedProducts: number;


    constructor(private productRequestController: IProductRequestController,
                private articles: number[], proxies: ProxyInfo[]) {
        this.proxiesInfo = proxies.map((proxy) => ({proxy, tasksInWork: 0}));
        this.productsCount = articles.length;
        this.articleQueueIndex = 0;
        this.completedProducts = 0;
        this.requestResult = [];
    }

    async requestProducts() {
        const requestPromise = new Promise<ResponseData<ProductResponseData>>(
            (resolve) => this.resolveFunction = resolve);
        this.distributeAndRequestProducts();
        this.timerHandler = setInterval(() => {
            this.distributeAndRequestProducts();
        }, Configs.PROXY_REQUEST_INTERVAL);
        return requestPromise;
    }

    async addTasksForProxy() {

    }

    private distributeAndRequestProducts(): void {
        for (const proxyInfo of this.proxiesInfo) {
            while ((proxyInfo.tasksInWork < Configs.MAX_PROXY_REQUESTS_COUNT) &&
            (this.articleQueueIndex !== this.productsCount)) {
                this.processArticleWithProxy(proxyInfo, this.articleQueueIndex++).then(() => {
                    this.completedProducts++;
                    if (this.completedProducts === this.productsCount) {
                        this.finishRequest();
                    }
                });
            }
        }
    }

    private async processArticleWithProxy(proxyInfo: ProxyTasksInfo, articleIndex: number) {
        proxyInfo.tasksInWork++;
        console.log(`Proxy ${proxyInfo.proxy.port} started with article ${articleIndex}`);
        this.requestResult[articleIndex] =
            await this.requestProductWithTries(this.articles[articleIndex], proxyInfo.proxy);
        console.log(`Proxy ${proxyInfo.proxy.port} ended with article ${articleIndex}`);
        proxyInfo.tasksInWork--;
    }

    private finishRequest() {
        clearInterval(this.timerHandler);
        this.resolveFunction({code: ResultCode.OK, result: this.requestResult});
    }

    private async requestProductWithTries(article: number, proxy?: ProxyInfo): Promise<ResponseData<ProductData>> {
        for (let i = 0; i < Configs.PRODUCT_REQUEST_FAIL_TIMES; i++) {
            const response = await this.productRequestController.getProductByArticle(article, proxy);
            // TODO: rework for prod
            if (response.code !== ResultCode.TIMEOUT) return response;
        }
        return {code: ResultCode.TIMEOUT}
    }
}
