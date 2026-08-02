import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js'
import userRouter from './routes/userRoutes.js'

const app = express()

console.log('URL utilisée:', process.env.MONGODB_URL)
await connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res) => res.send('Server is Live!'))
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})