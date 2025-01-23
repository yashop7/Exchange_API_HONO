import { Hono } from "hono";
export const tradesRouter = new Hono();

tradesRouter.get("/", async (c) => {
  const market = c.req.query("market");
  // get from DB
  return c.json({});
});
