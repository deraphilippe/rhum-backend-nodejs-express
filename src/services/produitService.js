import { PrismaClient } from "@prisma/client";
import Datetime from "../utils/datetime.js";


const prisma = new PrismaClient();

class ProduitService {
    static async findAll() {
        const produits = await prisma.produit.findMany()
        return produits
    }

    static async findGreaterThan(id, column) {
        const produits = await prisma.produit.findMany({ 
            where : { [column] : {
                gt : id
            } }
        })
        return produits
    }

    static async findById(id) {
        const produit = await prisma.produit.findUnique({ 
            where : {
                id : id
            },
            include : { stock : true }
        })
        return produit
    }

    static async findWithStock() {
        const produits = await prisma.produit.findMany({
            include: {
                stock: true
            }
        })
        return produits
    }

    static async store(data) {
        const date = Datetime.now()
        const produit = await prisma.produit.create({
            data: {
                "prixGros" : data.prixGros,
                "prixNorm" : data.prixNorm,
                "designation" : data.designation,
                "createdAt" : date,
                "updatedAt" : date
            }
        })
        return produit
    }

    static async update(data) {
        const produit = await prisma.produit.update({
            data: {
                "designation" : data.designation,
                "prixGros" : data.prixGros,
                "prixNorm" : data.prixNorm,
                "updatedAt" : Datetime.now()
            },
            where: { id: data.id }
        })
        return produit
    }
}

export default ProduitService