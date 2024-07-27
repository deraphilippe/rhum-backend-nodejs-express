import express from "express"

import ProduitService from "../services/produitService.js"
import Datetime from "../utils/datetime.js"
import getDataParse from "../utils/parser.js"
import SynchronisationService from "../services/synchronisationService.js"


const ProduitRouter = express.Router()

/**
 * Route pour recupérer les produits
 * request : null
 */
ProduitRouter.get("/produit", async (_, res) => {
    const produits = await ProduitService.findAll()
    res.status(200).json(produits)
})

/**
 * Route pour recupérer les produits
 * request : null
 */
ProduitRouter.get("/produit/after/:id", async (req, res) => {
    const id = parseInt(req.params.id)
    const produits = await ProduitService.findGreaterThan(id)
    res.status(200).json(produits)
})

/**
 * Route pour recupérer les produits avec leur stock respectif
 * request : null
 */
ProduitRouter.get("/produit/with-stock", async (_, res) => {
    const produits = await ProduitService.findWithStock()
    res.status(200).json(produits)
})

/**
 * Route pour recupérer un produit qui est supérieur à un ID donné
 * request : id = Int
 */
ProduitRouter.get("/produit/sync", async (req, res) => {
    const { id, update } = req.query

    if (id == undefined) {
        res.send([])
    } else {
        const valueId = update == undefined ? parseInt(id) : Datetime.parse(id)
        const column = update == undefined ? "id" : "updatedAt"
        const produit = await ProduitService.findGreaterThan(valueId, column)

        res.status(200).json(produit)
    }
})



/**
 * Route pour l'ajout de checkpoint
 * request : 
 *      {
 *          "name" : String
 *      }
 */
ProduitRouter.post("/produit/sync", async (req, res) => {
    const produits = getDataParse(req.body)

    for (let i = 0; i < produits.length; i++) {
        await ProduitService.store(produits[i])
    }

    await SynchronisationService.update({
        "userId": user.id,
        "value": Datetime.getDate(),
        "typeSync": "store",
        "tableName": "produit"
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
ProduitRouter.put("/produit/sync", async (req, res) => {
    const produits = getDataParse(req.body)
    let lastDateSync = ""
    for (let i = 0; i < produits.length; i++) {
        await ProduitService.update(produits[i])
        lastDateSync = produits[i]["createdAt"]
    }
    await SynchronisationService.update({
        "userId": user.id,
        "value": lastDateSync,
        "typeSync": "update",
        "tableName": "produit"
    }).then(() => {
        res.send({
            "status": true,
            "lastDateSync": lastDateSync
        })
    })
})



/**
 * Route pour recupérer un produit qui est supérieur à un ID donné
 * request : id = Int
 */
ProduitRouter.get("/produit/:id", async (req, res) => {
    const id = parseInt(req.params.id)
    const produit = await ProduitService.findById(id)
    res.status(200).json(produit)
})

/**
 * Route pour l'ajout d'un produit
 * request : 
 * {
 *     "id" : Int,
 *     "designation" : String,
 *     "prixGros" : Int
 *     "prixNorm" : Int
 * } 
 */
ProduitRouter.post("/produit", (req, res) => {
    const produit = ProduitService.store(req.body)
    res.status(200).json(produit)
})

/**
 * Route pour la modification d'un produit
 * request : 
 * {
 *     "id" : Int,
 *     "designation" : String,
 *     "prixGros" : Int
 *     "prixNorm" : Int
 * } 
 */
ProduitRouter.put("/produit", (req, res) => {
    const body = {
        "id": req.body.id,
        "designation": req.body.designation,
        "prixNorm": req.body.prixNorm,
        "prixGros": req.body.prixGros,
        "uptatedAt": req.body.uptatedAt
    }
    const produit = ProduitService.update(body)
    res.status(200).json(produit)
})

export default ProduitRouter