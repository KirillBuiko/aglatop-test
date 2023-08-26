import {ProxyInfo} from "@/types/DataTypes";

export interface IProxyDBController {
    getProxies(): Promise<ProxyInfo[]>;
    addProxy(proxy: ProxyInfo): Promise<void>;
}