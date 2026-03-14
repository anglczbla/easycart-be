import pgPromise from "pg-promise";

const pgp = pgPromise();

const dbEcommerce = pgp(
  "postgresql://postgres:postgres@localhost:5432/ecommerce",
);

export { dbEcommerce };
