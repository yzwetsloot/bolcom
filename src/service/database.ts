import pg from "pg";
const { Pool } = pg;

import config from "../config.js";

const pool = new Pool(config.database);

pool.on("error", (error, client) => {
  console.error(`Pool error event emitted ${error}`);
});

export default pool;
