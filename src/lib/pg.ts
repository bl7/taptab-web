import { Pool } from "pg";

// Cache the pool globally to persist between cold starts
let cachedPool: Pool | null = null;

function createPool(): Pool {
  return new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
    // Performance optimizations for serverless
    max: 10, // Reduced for serverless (was 20)
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Increased from 2s to 5s for cold starts
    maxUses: 1000, // Reduced from 7500 for serverless
    // Add keep-alive settings
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });
}

export async function getPool(): Promise<Pool> {
  if (!cachedPool) {
    console.log("🔥 Creating new database pool...");
    cachedPool = createPool();

    // Test the connection
    try {
      const client = await cachedPool.connect();
      await client.query("SELECT 1");
      client.release();
      console.log("✅ Database pool connection verified");
    } catch (error) {
      console.error("❌ Database pool connection failed:", error);
      // Clear cache on failure
      cachedPool = null;
      throw error;
    }

    // Handle pool errors
    cachedPool.on("error", (err) => {
      console.error("❌ Unexpected error on idle client:", err);
      // Clear cache on error
      cachedPool = null;
    });
  }

  return cachedPool;
}

// Legacy export for backward compatibility
const pool = createPool();
export default pool;

// Handle pool errors for legacy pool
pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client (legacy pool):", err);
  process.exit(-1);
});
