import {IProxyDBController} from "@/action-handlers/interfaces/IProxyDBController";
import {ProxyInfo} from "@/types/DataTypes";
import {withDBSession} from "@/db-controllers/utils";

export class ProxyDBController implements IProxyDBController{
    constructor() {
    }

    async getProxies(): Promise<ProxyInfo[]> {
        return withDBSession(async (session) => {
            return session.proxy.findMany();
        });
    }

    async addProxy(proxy: ProxyInfo): Promise<void> {
        return withDBSession(async (session) => {
            await session.proxy.create({
                data: proxy
            });
        });
    }
}
