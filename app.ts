import express from '@/express';
import {Configs} from '@/Configs';
import {dbController} from "@/db-controllers";

(async function init() {
    console.log(`Starting Express on port ${Configs.EXPRESS_PORT}...`);

    express(dbController).listen(Configs.EXPRESS_PORT, () => {
        console.log(`Express server started on ${Configs.HOST}:${Configs.EXPRESS_PORT}.`);
    });
})()