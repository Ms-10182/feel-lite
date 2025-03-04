import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors)

app.use(express.json({limit:"16kb"}))
app.use(urlencoded({extended:true}))
app.use(cookieParser())

export {app}