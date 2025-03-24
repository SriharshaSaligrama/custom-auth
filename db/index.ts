import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "./schema"
import { env } from '@/data/env/server';

export const db = drizzle({
    schema,
    connection: env.DATABASE_URL,
});
