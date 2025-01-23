import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { orderRouter } from './routes/order'
import { depthRouter } from './routes/depth'
import { tradesRouter } from './routes/trades'
import { klineRouter } from './routes/kline'
import { tickersRouter } from './routes/ticker'

const app = new Hono()

app.use('*', cors())

app.route('/api/v1/order', orderRouter)
app.route('/api/v1/depth', depthRouter)
app.route('/api/v1/trades', tradesRouter)
app.route('/api/v1/klines', klineRouter)
app.route('/api/v1/tickers', tickersRouter)

app.get('/as', (c) => c.text('Hello World'))

export default {
  fetch: app.fetch
}