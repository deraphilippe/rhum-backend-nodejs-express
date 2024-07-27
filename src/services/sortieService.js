import { PrismaClient } from "@prisma/client";
import StockService from "./stockService.js";
import Datetime from "../utils/datetime.js";


const prisma = new PrismaClient();

class SortieService {
    static async findAll() {
        const sorties = await prisma.sortie.findMany({ 
            include : { 
                produit : true 
            } 
        })
        return sorties
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
        
        
        const sorties = await prisma.sortie.findMany({
            where: where
        })
        return sorties
    }
    
    static async store(data, user, applied=true) {
        const date = Datetime.now()
        const values = data.map((sortie) => ({
            ...sortie,
            userId: user.id,
            createdAt : date,
            updatedAt : date
        }))

        const sorties = await prisma.sortie.createMany({
            data : values
        })
        for (var i = 0; i < data.length; i++) {
            const produitId = data[i].produitId
            const quantite = data[i].quantite
            if (data[i].apply == 1 && applied == true) {
                const stock = await StockService.findByCheckpointId(user.checkpoint.id, produitId)
                await StockService.updateByStockCheckpoint({ value: stock.value - quantite }, user.checkpoint.id, produitId)
            }
        }
        return sorties
    }

    static async update(data) {
        const sortie = await prisma.sortie.update({
            data: {
                "typePrix" : data.typePrix,
                "quantite" : data.quantite,
                "produitId" : data.produitId,
                "apply" : data.apply,
                "updatedAt" : Datetime.now()
            },
            where: { id: data.id }
        })
        return sortie
    }
}

export default SortieService