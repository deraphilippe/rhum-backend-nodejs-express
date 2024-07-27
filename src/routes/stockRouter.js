import express from "express"
import jwt from "jsonwebtoken"

import StockService from "../services/stockService.js"
import getDataParse from "../utils/parser.js"
import SynchronisationService from "../services/synchronisationService.js"
import Datetime from "../utils/datetime.js"


const StockRouter = express.Router()


/**
 * Route pour recupérer les stocks
 * request : null
 */
StockRouter.get("/stock", async (_, res) => {
    const stocks = await StockService.findAll()
    res.status(200).json(stocks)
})


/**
 * Route pour la recuperation des stocks d'un produit
 * request : produitId = Int
 */
StockRouter.get("/stock/byproduit/:produitId", async (req, res) => {
    const stocks = await StockService.findByProduitId(req.params.produitId)
    res.status(200).json(stocks)
})


/**
 * Route pour l'ajout d'un stock
 * request : 
 * {
 *     "checkpointId" : Int,
 *     "produitId" : Int
 * } 
 */
StockRouter.post("/stock", async (req, res) => {
    const stock = await StockService.store(req.body)
    res.status(200).json(stock)
})


/**
 * Route pour la modification d'un stock
 * request : 
 * {
 *     "id" : Int
 *     "checkpointId" : Int,
 *     "produitId" : Int
 * } 
 */
StockRouter.put("/stock", async (req, res) => {
    
    const body = {
        "id" : req.body.id,
        "produitId" : req.body.produitId,
        "checkpoinId" : req.body.checkpoinId,
        "value" : req.body.value,
        "uptatedAt" : req.body.uptatedAt
    } 
    const stock = await StockService.update(body)
    res.status(200).json(stock)
})


/**
 * Route pour la recuperation des commandes ou synchronisation 
 * distant
 * request : 
 *      {
 *           "id" : String,
 *           "paiement" : Int,
 *           "montant" : Int,
 *           "dateLiv" : DateTime,
 *           "clientId" : Int
 *      }
 */
StockRouter.get("/stock/sync", async (req, res) => {
    const { id, update } = req.query
    const user = jwt.decode(req.headers["authorization"])

    if (id == undefined) {
        res.send([])
    }
    else {
        let valueId = update == undefined ? parseInt(id) : Datetime.parse(id)
        const stocks = await StockService.findGreaterThan(valueId, update == undefined ? "id" : "updatedAt", {user : user})
        res.status(200).json(stocks)
    }
})


/**
 * Route pour la modification multiple ou synchronisation 
 * distant
 * request : Array<Stock>
 *      {
 *           "id" : Int,
 *           "produitId" : Int,
 *           "value" : Int
 *      }
 */
StockRouter.post("/stock/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const stocks = getDataParse(req.body)
    

    for (let i = 0; i < stocks.length; i++) {
        const data = {
            id : stocks[i]["id"],
            value: stocks[i]["value"],
            produitId : stocks[i]["produitId"],
            checkpointId : user.checkpoint.id,
            createdAt : stocks[i]["createdAt"],
            updatedAt: stocks[i]["updatedAt"]
        }
        await StockService.store(data)
    }
    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync": "store",
        "tableName": "stock"
    }).then(() => {
        res.send({
            "status": true,
            "lastDateSync": Datetime.getDate()
        })
    })
})

/**
 * Route pour la modification multiple ou synchronisation 
 * distant
 * request : Array<Stock>
 *      {
 *           "id" : Int,
 *           "produitId" : Int,
 *           "value" : Int
 *      }
 */
StockRouter.put("/stock/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const stocks = getDataParse(req.body)

    for (let i = 0; i < stocks.length; i++) {
        const data = {
            value: stocks[i]["value"],
            updatedAt: stocks[i]["updatedAt"]
        }
        await StockService.updateByStockCheckpoint(data, user.checkpoint.id, stocks[i].produitId)
    }

    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync": "stock",
        "tableName": "update"
    }).then(() => {
        res.send({
            "status": true,
            "lastDateSync": Datetime.getDate()
        })
    })
})


export default StockRouter