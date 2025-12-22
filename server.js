import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js'
import userRouter from './routes/userRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import creditRouter from './routes/creditRoutes.js'
import { stripeWebhooks } from './controllers/webhooks.js'

const app = express()

await connectDB()

// Middlewares
app.use(cors({
    origin: ['https://quick-gpt-gamma-lyart.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}))

// Stripe webhooks (must be before express.json())
app.post('/api/stripe', express.raw({type: 'application/json'}),
stripeWebhooks)

app.use(express.json())

// Routes
app.get('/', (req,res)=> res.send('Server is live'))
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)


const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})