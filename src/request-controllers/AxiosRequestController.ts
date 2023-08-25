import type {IRequestController} from "@/action-handlers/interfaces/IRequestController";
import axios, {AxiosError, type AxiosResponse} from "axios";
import type {AxiosInstance, AxiosRequestConfig} from "axios";
import {RequestData, ResponseData} from "@/types/DataTypes";
import ResultCode from "@/types/ResultCode";

export default class AxiosRequestController implements IRequestController {
    axiosInst: AxiosInstance

    constructor(baseURL: string) {
        this.axiosInst = axios.create({
            baseURL,
            headers: {
                Accept: "*/*"
            },
            withCredentials: true
        })
    }

    async makeRequest<K>(request: RequestData):
        Promise<ResponseData<K>> {
        const {url, body = {}, method = "POST"} = request;

        const proxy: AxiosRequestConfig["proxy"] = request.proxy ?
            ({
                protocol: "http",
                host: request.proxy.ip,
                port: request.proxy.port,
                auth: {
                    username: request.proxy.login,
                    password: request.proxy.password
                },
            }) : undefined;

        const config: AxiosRequestConfig = {
            responseType: request.options?.responseType || "json",
            proxy,
            ...request.options
        }

        const requestBody = body;

        let response;
        try {
            let result: AxiosResponse<K> | undefined = undefined;
            if (method == "GET") {
                config.params = requestBody;
                result = await this.axiosInst.get<K>(url, config);
            } else if (method == "POST") {
                result = await this.axiosInst.post<K>(url, requestBody, config);
            }
            if (!result) {
                return {code: ResultCode.CONFIGURATION_ERROR}
            }
            response = {code: ResultCode.OK, result: result.data};
        } catch (err) {
            if (!(err instanceof AxiosError)) {
                response = {code: ResultCode.FAIL, error: {description: "Unknown error"}};
            } else if (!err.response) {
                if (err.request) {
                    response = {code: ResultCode.CONNECTION_ERROR, error: {description: err.request}};
                } else {
                    response = {code: ResultCode.CONFIGURATION_ERROR, error: {description: err.message}};
                }
            } else {
                response = {code: ResultCode.FAIL, error: err.response.data};
            }
        }
        return response;
    }
}
