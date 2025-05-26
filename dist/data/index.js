"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_process_1 = require("node:process");
const db_1 = require("../config/db");
const clearData = async () => {
    try {
        await db_1.db.sync({ force: true });
        console.log("should register a  new user succefully");
        (0, node_process_1.exit)(0);
    }
    catch (error) {
        (0, node_process_1.exit)(1);
    }
};
if (process.argv[2] === '--clear') {
    clearData();
}
//# sourceMappingURL=index.js.map