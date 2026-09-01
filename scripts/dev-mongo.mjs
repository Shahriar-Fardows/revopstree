/**
 * Starts a throwaway in-memory MongoDB and keeps it running.
 *
 *   node scripts/dev-mongo.mjs
 *
 * Prints a connection string to paste into .env.local. Data lives only in
 * memory — every restart is a clean database. This exists so the console can
 * be developed and verified without an Atlas cluster; production always uses
 * the real MONGODB_URI.
 */
import { writeFileSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";

const server = await MongoMemoryServer.create({ instance: { dbName: "revopstree" } });
const uri = server.getUri();

writeFileSync(new URL("../.dev-mongo-uri", import.meta.url), uri, "utf8");

console.log("In-memory MongoDB running.");
console.log(`MONGODB_URI="${uri}"`);
console.log("Press Ctrl+C to stop. All data is lost on exit.");

const shutdown = async () => {
  await server.stop();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Keep the event loop alive.
setInterval(() => {}, 1 << 30);
