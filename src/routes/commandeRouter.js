import express from "express"
import jwt from "jsonwebtoken"

import CommandeService from "../services/commandeService.js"
import SynchronisationService from "../services/synchronisationService.js"
import getDataParse from "../utils/parser.js"
import Datetime from "../utils/datetime.js"


const CommandeRouter = express.Router()


/**
 * Route pour la recupération des commandes
 * request : null
 */
CommandeRouter.get("/commande", async (_, res) => {
    const commandes = await CommandeService.findAll()
    res.status(200).json(commandes)
})


/**
 * Route pour l'ajout de commande
 * request : 
 *      {
 *           "id" : String,
 *           "paiement" : Int,
 *           "montant" : Int,
 *           "dateLiv" : DateTime,
 *           "clientId" : Int,
 *           "sorties" : Array<Sortie>?
 *                {
 *                   "id" : String,
 *                   "quantite" : Int,
 *                   "apply" : Int,
 *                   "typePrix" : String,
 *                   "produitId" : Int
 *                },
 *            ]
 *         }req.params.id
 */
CommandeRouter.post("/commande", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const commande = await CommandeService.store(req.body, user)
    res.status(200).json(commande)
})


/**
 * Route pour la modification d'un commande
 * request : 
 *      {
 *           "id" : String,
 *           "paiement" : Int,
 *           "montant" : Int,
 *           "dateLiv" : DateTime,
 *           "clientId" : Int,
 *           "sorties" : Array<Sortie>?
 *                {
 *                   "id" : String,
 *                   "quantite" : Int,
 *                   "apply" : Int,
 *                   "typePrix" : String,
 *                   "produitId" : Int
 *                },
 *            ]
 *         }
 */
CommandeRouter.put("/commande", async (req, res) => {
    const commande = await CommandeService.update(req.body)
    res.status(200).json(commande)
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
CommandeRouter.get("/commande/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const { date, update } = req.query
    if (date == undefined) {
        res.status(200).json([])
    }
    else {
        const commandes = await CommandeService.findGreaterThan(date, update == undefined ? "createdAt" : "updatedAt", { user : user })
        res.status(200).json(commandes)
    }
})


/**
 * Route pour l'ajout multiple ou synchronisation 
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
CommandeRouter.post("/commande/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const commandes = getDataParse(req.body)
  
    for (let i = 0; i < commandes.length; i++) {
        await CommandeService.store(commandes[i], user)
    }
    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync": "store",
        "tableName": "commande"
    }).then(() => {
        res.send({
            "status": true,
            "sync_date": Datetime.getDate()
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
CommandeRouter.put("/commande/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const commandes = getDataParse(req.body)

    for (let i = 0; i < commandes.length; i++) {
        await CommandeService.update(commandes[i], user)
    }

    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync": "update",
        "tableName": "commande"
    }).then(() => {
        res.send({
            "status": true,
            "sync_date": Datetime.getDate()
        })
    })
})


export default CommandeRouter