import express from "express"

import CheckpointService from "../services/checkpointService.js"
import Datetime from "../utils/datetime.js"
import getDataParse from "../utils/parser.js"
import SynchronisationService from "../services/synchronisationService.js"


import jwt from "jsonwebtoken"


const CheckpointRouter = express.Router()

/**
 * Route pour la recuperation des checkpoints
 * request : null
 */
CheckpointRouter.get("/checkpoint", async (_, res) => {
    const checkpoints = await CheckpointService.findAll()
    res.status(200).json(checkpoints)
})


/**
 * Route pour la recuperation des checkpoints
 * request : null
 */
CheckpointRouter.get("/checkpoint/sync", async (req, res) => {
    const { id, update } = req.query

    if (id == undefined) {
        res.status(200).json([])
    }
    else {
        const column = update == undefined ? "id" : "updatedAt"
        const valueId = update == undefined ? parseInt(id) : Datetime.parse(id)
        const checkpoints = await CheckpointService.findGreaterThan(valueId, column)
        res.status(200).json(checkpoints)
    }
})


/**
 * Route pour l'ajout de checkpoint
 * request : 
 *      {
 *          "name" : String
 *      }
 */
CheckpointRouter.post("/checkpoint/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const checkpoints = getDataParse(req.body)

    for (let i = 0; i < checkpoints.length; i++) {
        await CheckpointService.store(checkpoints[i])
    }

    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync": "store",
        "tableName": "checkpoint"
    }).then(() => {
        res.send({
            "status": true,
            "lastDateSync": lastDateSync
        })
    })
})


/**
 * Route pour l'ajout de checkpoint
 * request : 
 *      {
 *          "name" : String
 *      }
 */
CheckpointRouter.put("/checkpoint/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const checkpoints = getDataParse(req.body)

    for (let i = 0; i < checkpoints.length; i++) {
        await CheckpointService.update(checkpoints[i])
    } 
    
    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync": "update",
        "tableName": "checkpoint"
    }).then(() => {
        res.send({
            "status": true,
            "lastDateSync": Datetime.getDate()
        })
    })
})


/**
 * Route pour l'ajout de checkpoint
 * request : 
 *      {
 *          "name" : String
 *      }
 */
CheckpointRouter.post("/checkpoint", async (req, res) => {
    const checkpoint = await CheckpointService.store(req.body)
    res.status(200).json(checkpoint)
})

CheckpointRouter.put("/checkpoint", async (req, res) => {
    const checkpoint = await CheckpointService.update(req.body)
    res.status(200).json(checkpoint)
})
export default CheckpointRouter