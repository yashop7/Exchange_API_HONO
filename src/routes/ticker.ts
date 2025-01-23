import { Hono } from "hono";

const tickersRouter = new Hono();

tickersRouter.get("/", (c) => {
  return c.json(["TATA_INR"]);
});

export { tickersRouter };
