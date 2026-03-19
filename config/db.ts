import dotenv from "dotenv";
dotenv.config();

import pgPromise from "pg-promise";

const pgp = pgPromise();

const dbEcommerce = pgp(process.env.DB_URL as string);

export { dbEcommerce };
