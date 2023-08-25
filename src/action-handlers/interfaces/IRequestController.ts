import type {RequestData, ResponseData} from "@/types/DataTypes";

export interface IRequestController {
    makeRequest<K>(request: RequestData): Promise<ResponseData<K>>
}
