import { PrismaClient } from "@prisma/client";
import StockService from "./stockService.js";
import Datetime from "../utils/datetime.js";


const prisma = new PrismaClient();

class EntreService {
    static async findAll() {
        const entres = await prisma.entre.findMany({
            include: {
                produit: true
            }
        })
        return entres
    }

    static async findGreaterThan(date, column, { user }) {
        var where = {
            [column]: {
                gt: Datetime.parse(date)
            },
            
        }
        
        if (user.usertype == "admin") {
            if (date != "0000-00-00 00:00:00") {
                where["userId"] = {
                    not: user.id
                }
            }
        }
        else {
            where["userId"] = user.id
        }
        
        const entres = await prisma.entre.findMany({
            where: where
        })
        return entres
    }

    static async store(data, user, applied = true) {
        const date = Datetime.now()
        const entres = data.map((entre) => ({
            ...entre,
            userId: user.id,
            createdAt : date,
            updatedAt : date
        }))

        await prisma.entre.createMany({
            data: entres
        })

        for (var i = 0; i < data.length; i++) {
            const produitId = data[i].produitId
            const quantite = data[i].quantite
            if (applied == true) {
                const stock = await StockService.findByCheckpointId(user.checkpoint.id, produitId)
                await StockService.updateByStockCheckpoint({ value: stock.value + quantite }, user.checkpoint.id, produitId)
            }
        }
        return entres
    }

    static async update(data) {
        const entre = await prisma.entre.update({
            data: {
                "produitId": data.produitId,
                "quantite": data.quantite,
                "updatedAt": Datetime.now()
            },
            where: { id: data.id }
        })
        return entre
    }
}

export default EntreService