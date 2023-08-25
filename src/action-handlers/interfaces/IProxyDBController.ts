import {ProxyInfo} from "@/types/DataTypes";

export interface IProxyDBController {
    getProxies(): Promise<ProxyInfo[]>;
    addProxies(proxy: ProxyInfo): Promise<void>;
}