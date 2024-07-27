import express from "express"
import jwt from "jsonwebtoken"

import EntreService from "../services/entreService.js"
import SynchronisationService from "../services/synchronisationService.js"
import getDataParse from "../utils/parser.js"
import Datetime from "../utils/datetime.js"


const EntreRouter = express.Router()


/**
 * Route pour recupérer les entrées
 * request : null
 */
EntreRouter.get("/entre", async (_, res) => {
    const entres = await EntreService.findAll()
    res.status(200).json(entres)
})


/**
 * Route pour ajouter des entrées
 * request : Array<Entre>
 *      {
 *          "id" : String,
 *          "quantite" : Int,
 *          "produitId" : Int
 *      }
 */
EntreRouter.post("/entre", (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const entres = EntreService.store(req.body, user)
    res.status(200).json(entres)
})


/**
 * Route pour modifier une entrée
 * request : 
 *      {
 *          "id" : String,
 *          "quantite" : Int,
 *          "produitId" : Int
 *      }
 */
EntreRouter.put("/entre", (req, res) => {
    const entre = EntreService.update(req.body)
    res.status(200).json(entre)
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
EntreRouter.get("/entre/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const { date, update } = req.query
    if(date==undefined) {
        res.status(200).json([])
    }
    else {
        const entres = await EntreService.findGreaterThan(date, update == undefined ? "createdAt" : "updatedAt", { user : user })
        res.status(200).json(entres)
    }
})



/**
 * Route pour l'ajout multiple ou synchronisation 
 * distant
 * request : Array<Entre>
 *      {
 *           "id" : String,
 *           "quantite" : Int,
 *           "createdAt" : String,
 *           "updatedAt" : String,
 *           "produitId" : String
 *      }
 */
EntreRouter.post("/entre/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const entres = getDataParse(req.body)

    await EntreService.store(entres, user, false)

    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync" : "store",
        "tableName": "entre"
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
 * request : Array<Entre>
 *      {
 *           "id" : String,
 *           "quantite" : Int,
 *           "createdAt" : String,
 *           "updatedAt" : String,
 *           "produitId" : String
 *      }
 */
EntreRouter.put("/entre/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const entres = getDataParse(req.body)

    for (let i = 0; i < entres.length; i++) {
        await EntreService.update(entres[i])
    }

    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync" : "update",
        "tableName": "entre"
    }).then(() => {
        res.send({
            "status": true,
            "lastDateSync": Datetime.getDate()
        })
    })
})

export default EntreRouter