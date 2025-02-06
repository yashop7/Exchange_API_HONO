import { Client } from 'pg';
import { Hono } from 'hono';
import { RedisManager } from "../RedisManager";

const dbUrl = process.env.DATABASE_URL;
const pgClient = new Client({
    connectionString: dbUrl, // Railway's full connection URL
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false, // Required for Railway
  });
  
  pgClient
    .connect()
    .then(() => console.log("🚀 Connected to Railway PostgreSQL!"))
    .catch((err) => console.error("❌ Connection error", err));

export const klineRouter = new Hono();

klineRouter.get("/", async (c) => {
    console.log("Fetching kline data...");
    const { market, interval, startTime, endTime } = c.req.query();

    let query;
    switch (interval) {
        case '1m':
            query = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
            break;
        case '1h':
            query = `SELECT * FROM klines_1h WHERE  bucket >= $1 AND bucket <= $2`;
            break;
        case '1w':
            query = `SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2`;
            break;
        default:
            return c.json({ error: 'Invalid interval' }, 400);
    }

    try {
        const result = await pgClient.query(query, [new Date(Number(startTime) * 1000), new Date(Number(endTime) * 1000)]);
        return c.json(result.rows.map(x => ({
            close: x.close,
            end: x.bucket,
            high: x.high,
            low: x.low,
            open: x.open,
            quoteVolume: x.quoteVolume,
            start: x.start,
            trades: x.trades,
            volume: x.volume,
        })));
    } catch (err) {
        console.log(err);
        return c.json({ error: err }, 500);
    }
});
