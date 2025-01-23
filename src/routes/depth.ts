import { Hono } from 'hono'
import { RedisManager } from '../RedisManager'
import { GET_DEPTH } from '../types'

export const depthRouter = new Hono()

depthRouter.get('/', async (c) => {
    const symbol = c.req.query('symbol')
    const response = await RedisManager.getInstance().sendAndAwait({
        type: GET_DEPTH,
        data: { market: symbol as string },
    })
    return c.json(response.payload)
})
