import { Hono } from "hono";
import { RedisManager } from "../RedisManager";
import { CREATE_ORDER, CANCEL_ORDER, ON_RAMP, GET_OPEN_ORDERS } from "../types";

const orderRouter = new Hono();

orderRouter.post("/", async (c) => {
  try {
    const { market, price, quantity, side, userId } = await c.req.json();
    console.log("Hello this is my request");
    console.log("price: ", price);
    console.log("market: ", market);

    const response = await RedisManager.getInstance().sendAndAwait({
      type: CREATE_ORDER,
      data: {
        market,
        price,
        quantity,
        side,
        userId,
      },
    });
    console.log("response.payload: ", response.payload || "No response");
    return c.json(response.payload);
  } catch (e) {
    console.log("Error: ", e);
    return c.json({ error: "An error occurred" }, 500);
  }
});

orderRouter.delete("/", async (c) => {
  const { orderId, market } = await c.req.json();
  const response = await RedisManager.getInstance().sendAndAwait({
    type: CANCEL_ORDER,
    data: {
      orderId,
      market,
    },
  });
  return c.json(response.payload);
});

orderRouter.get("/open", async (c) => {
  const userId = c.req.query("userId");
  const market = c.req.query("market");

  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }
  if (!market) {
    return c.json({ error: "market is required" }, 400);
  }

  const response = await RedisManager.getInstance().sendAndAwait({
    type: GET_OPEN_ORDERS,
    data: {
      userId,
      market,
    },
  });
  return c.json(response.payload);
});

orderRouter.post("/onramp", async (c) => {
  const { amount, userId } = await c.req.json();
  const response = await RedisManager.getInstance().sendAndAwait({
    type: ON_RAMP,
    data: {
      amount,
      userId,
    },
  });
  return c.json(response.payload);
});

orderRouter.get("/balance", async (c) => {
  const userId = c.req.query("userId");
  const market = c.req.query("market");
  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }
  if (!market) {
    return c.json({ error: "market is required" }, 400);
  }

  try {
    console.log("userId: ", userId);
    const response = await RedisManager.getInstance().sendAndAwait({
      type: "GET_BALANCE",
      data: {
        userId,
        market,
      },
    });
    return c.json(response.payload);
  } catch (e) {
    console.log("Error: ", e);
    return c.json({ error: "An error occurred" }, 500);
  }
});

export { orderRouter };
