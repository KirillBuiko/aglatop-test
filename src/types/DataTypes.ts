import ResultCode from "@/types/ResultCode";
import {AxiosRequestConfig} from "axios";

export interface RequestData {
    url: string;
    method?: "POST" | "GET";
    body?: any;
    proxy?: ProxyInfo,
    options?: AxiosRequestConfig;
}

export interface ResponseData<K> {
    code: ResultCode;
    result?: K;
}

export type ProductData = void;

export type ProductResponseData = ResponseData<ProductData>[];

export interface ProxyInfo {
    ip: string,
    port: number,
    login: string,
    password: string
}
