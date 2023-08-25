import {ProductData, ProxyInfo, ResponseData} from "@/types/DataTypes";

export interface IProductRequestController {
    getProductByArticle(article: number, proxy?: ProxyInfo): Promise<ResponseData<ProductData>>;
}