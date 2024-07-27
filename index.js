import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import UserRouter from "./src/routes/userRouter.js"
import AuthRouter from "./src/routes/authRouter.js"
import ProduitRouter from "./src/routes/produitRouter.js"
import CommandeRouter from "./src/routes/commandeRouter.js"
import CheckpointRouter from "./src/routes/checkpointRouter.js"
import SortieRouter from "./src/routes/sortieRouter.js"
import PaymentRouter from "./src/routes/paymentRouter.js"
import StockRouter from "./src/routes/stockRouter.js"
import ClientRouter from "./src/routes/clientRouter.js"
import EntreRouter from "./src/routes/entreRouter.js"
import Datetime from "./src/utils/datetime.js"

dotenv.config()


const port = process.env.PORT
const app = express()

app.use(cors({ origin : "*" }))
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
/**
app.use((req, res, next) => {
    const delay = 2000
    setTimeout(next, delay)
})
     */

app.use("/api", AuthRouter)
app.use("/api", ProduitRouter)
app.use("/api", CommandeRouter)
app.use("/api", SortieRouter)
app.use("/api", EntreRouter)
app.use("/api", PaymentRouter)
app.use("/api", CheckpointRouter)
app.use("/api", UserRouter)
app.use("/api", StockRouter)
app.use("/api", ClientRouter)

app.use("/", (req, res) => {
    res.send("Welcome ! You're now connected in the network.")
})

/**
const host = "192.168.43.244"
const host = "0.0.0.0"
 */

app.listen(port, () => {
    console.log(`server is running in port ${port} `)
})