import express from "express"

import UserService from "../services/userService.js"
import generateToken from "../utils/tokenization.js"
import hashPassword from "../utils/password.js"


const AuthRouter = express.Router()

/**
 * Route pour l'authentification
 * request : 
 *      {
 *          "phone" : String,
 *          "password" : String
 *      }
 */
AuthRouter.post("/auth/login", async (req, res) => {
    req.body.password = hashPassword(req.body.password)
    const user = await UserService.findUnique(req.body)
    if (user == null) {
        res.status(401).json({ error: 'Téléphone invalide' });
    }
    else {
        if (req.body.password != user.password) {
            res.status(401).json({ error: 'Mot de passe invalide' });
        }
        else {
            const token = generateToken(user);
            res.status(200).json({ token :  token });
        }
    }
})

export default AuthRouter