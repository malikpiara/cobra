import { DataSource } from "typeorm";
import { Comment } from "./entity/Comment";

export const myDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    host: process.env.POSTGRES_WRITER_HOST,
    port: 5432,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    entities: [Comment],
    logging: false,
    synchronize: true,
    // Comment when in development mode.
    ssl: {
        rejectUnauthorized: false,
      }
})