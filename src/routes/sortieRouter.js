import express from "express"
import jwt from "jsonwebtoken"

import SortieService from "../services/sortieService.js"
import getDataParse from "../utils/parser.js"
import SynchronisationService from "../services/synchronisationService.js"
import Datetime from "../utils/datetime.js"


const SortieRouter = express.Router()

/**
 * Route pour recupérer les sorties
 * request : null
 */
SortieRouter.get("/sortie", async (_, res) => {
    const sorties = await SortieService.findAll()
    res.status(200).json(sorties)
})


/**
 * Route pour ajouter des sorties
 * request : Array<Sortie>
 *      {
 *          "id" : String,
 *          "quantite" : Int,
 *          "produitId" : Int,
 *          "typePrix" : String
 *      }
 */
SortieRouter.post("/sortie", (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const sortie = SortieService.store(req.body, user)
    res.status(200).json(sortie)
})


/**
 * Route pour modifier une sortie
 * request : Sortie
 *      {
 *          "id" : String,
 *          "quantite" : Int,
 *          "produitId" : Int,
 *          "commandeId" : Int,
 *          "typePrix" : String
 *      }
 */
SortieRouter.put("/sortie", (req, res) => {
    const sortie = SortieService.update(req.body)
    res.status(200).json(sortie)
})

SortieRouter.get("/sortie/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const { date, update } = req.query
    if(date==undefined) {
        res.status(200).json([])
    }
    else {
        const sortie = await SortieService.findGreaterThan(date, update == undefined ? "createdAt" : "updatedAt", { user : user })
        res.status(200).json(sortie)
    }
})

/**
 * Route pour l'ajout multiple ou synchronisation 
 * distant
 * request : Array<Sortie>
 *      {
 *           "id" : String,
 *           "quantite" : Int,
 *           "commandeId" : Int,
 *           "produitId" : String,
 *           "createdAt" : String,
 *           "updatedAt" : String
 *      }
 */
SortieRouter.post("/sortie/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const sorties = getDataParse(req.body)
    await SortieService.store(sorties, user, false)

    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync" : "store",
        "tableName": "sortie"
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
 * request : 
 *      {
 *           "id" : String,
 *           "paiement" : Int,
 *           "montant" : Int,
 *           "dateLiv" : DateTime,
 *           "clientId" : Int
 *      }
 */
SortieRouter.put("/sortie/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const sorties = getDataParse(req.body)

    let lastDateSync = ""
    for (let i = 0; i < sorties.length; i++) {
        await SortieService.update(sorties[i])
        lastDateSync = sorties[i]["updatedAt"]
    }

    await SynchronisationService.update({
        "userId": user.id,
        "value": lastDateSync,
        "typeSync" : "update",
        "tableName": "sortie"
    }).then(() => {
        res.send({
            "status": true,
            "lastDateSync": lastDateSync
        })
    })
})


export default SortieRouter