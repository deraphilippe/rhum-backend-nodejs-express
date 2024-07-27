import express from "express"

import PaymentService from "../services/paymentService.js"
import getDataParse from "../utils/parser.js"
import SynchronisationService from "../services/synchronisationService.js"
import Datetime from "../utils/datetime.js"


const PaymentRouter = express.Router()

/**
 * Route pour recupérer les paiements
 * request : null
 */
PaymentRouter.get("/payment", async (_, res) => {
    const payments = await PaymentService.findAll()
    res.status(200).json(payments)
})

PaymentRouter.get("/payment/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const { date, update } = req.query
    if(date==undefined) {
        res.status(200).json([])
    }
    else {
        const payment = await PaymentService.findGreaterThan(date, update == undefined ? "createdAt" : "updatedAt", { user : user })
        res.status(200).json(payment)
    }
})

PaymentRouter.post("/payment/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const payments = getDataParse(req.body)

    await PaymentService.store(payments, user)

    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync" : "store",
        "tableName": "payment"
    }).then(() => {
        res.send({
            "status": true,
            "lastDateSync": Datetime.getDate()
        })
    })
})

PaymentRouter.put("/payment/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const payments = getDataParse(req.body)

    for (let i = 0; i < payments.length; i++) {
        await PaymentService.update(payments[i])
    }

    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync" : "update",
        "tableName": "payment"
    }).then(() => {
        res.send({
            "status": true,
            "lastDateSync": Datetime.getDate()
        })
    })
})


/**
 * Route pour l'ajout d'un paiement
 * request : 
 * {
 *     "id" : String,
 *     "commandeId" : Int,
 *     "montant" : Int
 * } 
 */
PaymentRouter.post("/payment", (req, res) => {
    const payment = PaymentService.store(req.body)
    res.status(200).json(payment)
})

/**
 * Route pour la modification d'un paiement
 * request : 
 * {
 *     "id" : String,
 *     "commandeId" : Int,
 *     "montant" : Int
 * } 
 */
PaymentRouter.put("/payment", (req, res) => {
    const payment = PaymentService.update(req.body)
    res.status(200).json(payment)
})

export default PaymentRouter