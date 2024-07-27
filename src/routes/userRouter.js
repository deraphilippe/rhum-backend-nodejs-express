import express from "express"
import jwt from "jsonwebtoken"

import UserService from "../services/userService.js"
import hashPassword from "../utils/password.js"
import Datetime from "../utils/datetime.js"
import getDataParse from "../utils/parser.js"
import SynchronisationService from "../services/synchronisationService.js"


const UserRouter = express.Router()


/**
 * Route pour la recuperation des checkpoints
 * request : null
 */
UserRouter.get("/user/sync", async (req, res) => {
    const { id, update } = req.query
    if (id == undefined) {
        res.status(200).json([])
    }
    else {
        const column = update == undefined ? "id" : "updatedAt"
        const valueId = update == undefined ? parseInt(id) : Datetime.parse(id)
        const users = await UserService.findGreaterThan(valueId, column)
       
        res.status(200).json(users)
    }
})


/**
 * Route pour l'ajout de checkpoint
 * request : 
 *      {
 *          "name" : String
 *      }
 */
UserRouter.post("/user/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const users = getDataParse(req.body)

    for (let i = 0; i < users.length; i++) {
        await UserService.store(users[i])
    }
    
    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync" : "update",
        "tableName": "sortie"
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
UserRouter.put("/user/sync", async (req, res) => {
    const user = jwt.decode(req.headers["authorization"])
    const users = getDataParse(req.body)
    let lastDateSync = ""
    for (let i = 0; i < users.length; i++) {
        await UserService.update(users[i])
        lastDateSync = users[i]["createdAt"]
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


/**
 * Route pour ajouter un user
 * request : 
 *  {
 *      "name" : String,
 *      "phone" : String,
 *      "password" : String,
 *      "checkpointId" : Int
 *  }
 */
UserRouter.post("/auth/register", async (req, res) => {
    req.body.password = hashPassword(req.body.password)
    const user = await UserService.store(req.body)
    res.status(200).json(user)
})

export default UserRouter