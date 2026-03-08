import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pgTable, integer, text, serial } from "drizzle-orm/pg-core";
import { b as private_env } from "./shared-server.js";
const task = pgTable("task", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  priority: integer("priority").notNull().default(1)
});
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  task
}, Symbol.toStringTag, { value: "Module" }));
if (!private_env.DB_URL) throw new Error("DB_URL is not set");
const connectionString = private_env.DB_SSL === "true" ? `${private_env.DB_URL}?sslmode=require` : private_env.DB_URL;
const client = postgres(connectionString, { max: 10 });
const db = drizzle(client, { schema });
export {
  db as d
};
