import bcrypt from "bcrypt"


// Fonction pour hacher le mot de passe avec un salt fixe
function hashPassword(password) {
    const hashedPassword = bcrypt.hashSync(password, process.env.SALT);
    
    return hashedPassword;
}

export default hashPassword