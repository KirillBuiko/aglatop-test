import {PrismaClient} from "@prisma/client";

export async function withDBSession<T>(callback: (session: PrismaClient) => Promise<T>): Promise<T> {
    const client = new PrismaClient();
    const result = await callback(client);
    client.$disconnect();
    return result;
}