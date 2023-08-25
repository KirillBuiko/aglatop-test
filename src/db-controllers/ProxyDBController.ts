import {IProxyDBController} from "@/action-handlers/interfaces/IProxyDBController";
import {ProxyInfo} from "@/types/DataTypes";
import {PrismaClient} from "@prisma/client";

export class ProxyDBController implements IProxyDBController{
    constructor() {
    }

    async getProxies(): Promise<ProxyInfo[]> {
        const prisma = new PrismaClient();
        const proxies = await prisma.proxy.findMany();
        await prisma.$disconnect();
        return proxies;
    }

    async addProxies(proxy: ProxyInfo): Promise<void> {
        const prisma = new PrismaClient();
        await prisma.proxy.create({
            data: proxy
        });
        await prisma.$disconnect();
    }
}
