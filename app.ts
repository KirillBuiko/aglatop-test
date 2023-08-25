import express from '@/express';
import {Configs} from '@/Configs';
import {dbController} from "@/db-controllers";

// async function assertDatabaseConnectionOk() {
//     console.log(`Checking database connection...`);
//     try {
//         await AppDataSource.initialize();
//         console.log("Database initialized")
//     } catch (error) {
//         console.log('Unable to connect to the database:');
//         console.log(error);
//         process.exit(1);
//     }
// }

(async function init() {
    // await assertDatabaseConnectionOk();
    console.log(`Starting Express on port ${Configs.EXPRESS_PORT}...`);

    express(dbController).listen(Configs.EXPRESS_PORT, () => {
        console.log(`Express server started on ${Configs.HOST}:${Configs.EXPRESS_PORT}.`);
    });
})()