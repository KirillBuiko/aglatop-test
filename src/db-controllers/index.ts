import {IDBController} from "@/action-handlers/interfaces/IDBController";
import {ProxyDBController} from "@/db-controllers/ProxyDBController";

export const dbController: IDBController = {
    proxy: new ProxyDBController()
}
