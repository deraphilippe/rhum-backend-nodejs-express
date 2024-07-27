import express from "express"

import ClientService from "../services/clientService.js"
import getDataParse from "../utils/parser.js"
import SynchronisationService from "../services/synchronisationService.js"

import jwt from "jsonwebtoken"
import Datetime from "../utils/datetime.js"

const ClientRouter = express.Router()

/**
 * Route pour la recupération des clients
 * request : null
 */
ClientRouter.get("/client", async (_, res) => {
    const clients = await ClientService.findAll()
    res.status(200).json(clients)
})

/**
 * Route pour recupérer un client qui est supérieur à un ID donné
 * request : id = Int
 */
ClientRouter.get("/client/sync", async (req, res) => {
    const { date, update } = req.query
    const user = jwt.decode(req.headers["authorization"])

    if (date == undefined) {
        res.status(200).send([])
    }
    else {
        const client = await ClientService.findGreaterThan(date, update == undefined ? "createdAt" : "updatedAt", { user : user })
        res.status(200).json(client)
    }
})


/**
 * Route pour l'ajout de client
 * request : 
 *      {
 *          "name" : String
 *      }
 */
ClientRouter.post("/client/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const clients = getDataParse(req.body)
    
    for (let i = 0; i < clients.length; i++) {
        await ClientService.store({
            ...clients[i],
            "userId" : user.id
        })
    }

    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync": "update",
        "tableName": "client"
    }).then(() => {
        res.send({
            "status": true,
            "lastDateSync": lastDateSync
        })
    })
})


/**
 * Route pour l'ajout de client
 * request : 
 *      {
 *          "name" : String
 *      }
 */
ClientRouter.put("/client/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const clients = getDataParse(req.body)
 
    for (let i = 0; i < clients.length; i++) {
        await ClientService.update(clients[i])
    }
    res.status(200).send({
        "status": true,
        "lastDateSync": Datetime.getDate()
    })

    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync": "update",
        "tableName": "client"
    }).then(() => {
        res.send({
            "status": true,
            "lastDateSync": lastDateSync
        })
    })
})


/**
 * Route pour la recupération d'un client grâce à
 * son ID
 * request : id = int
 */
ClientRouter.get("/client/id/:id", async (req, res) => {
    const id = req.params.id
    const client = await ClientService.findById(id)
    res.status(200).json(client)
})


/**
 * Route pour l'ajout de client
 * request : 
 *       {
 *           "nom" : String,
 *           "phone" : String
 *       }
 */
ClientRouter.post("/client", async (req, res) => {
    const client = await ClientService.store(req.body)
    res.status(200).json(client)
})

/**
 * Route pour la modification d'un client
 * request : 
 *       {
 *           "nom" : String,
 *           "phone" : String
 *       }
 */
ClientRouter.put("/client", async (req, res) => {
    const body = {
        "id": req.body.id,
        "nom": req.body.nom,
        "phone": req.body.phone,
        "uptatedAt": req.body.uptatedAt
    }
    const client = await ClientService.update(body)
    res.status(200).json(client)
})

export default ClientRouter