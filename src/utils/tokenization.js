import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()


// Fonction pour générer un token JWT
function generateToken(user) {
    const payload = {
        id: user.id,
        phone: user.phone,
        name: user.name,
        usertype : user.usertype,
        checkpoint : user.checkpoint
    };
    const secret = process.env.JWT_SECRET;
    // Le token expire dans 1 heure
    const options = {};

    return jwt.sign(payload, secret, options);
}

// Fonction pour la verification de token
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
        // Si aucun token n'est fourni
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Si le token est invalide
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    });
}

export default generateToken