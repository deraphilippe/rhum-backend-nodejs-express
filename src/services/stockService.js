import { PrismaClient } from "@prisma/client";
import Datetime from "../utils/datetime.js";


const prisma = new PrismaClient();

class StockService {
    static async findAll() {
        const stocks = await prisma.stock.findMany()
        return stocks
    }

    static async findByProduitId(produitId) {
        const stocks = await prisma.stock.findMany({
            where: {
                produitId: produitId
            }
        })
        return stocks
    }

    static async findGreaterThan(value, column, { user }) {
        var where = {
            [column]: {
                gt: value
            }
        }
        
        if (user.usertype == "simple") {
            where["checkpointId"] = user.checkpoint.id
        }
        else {
            if (value != "0000-00-00 00:00:00" && value!="0") {
                where["checkpointId"] = {
                    not: user.checkpoint.id
                }
            }
        }
        
        const stocks = await prisma.stock.findMany({
            where: where
        })
        return stocks
    }

    static async findByCheckpointId(checkpointId, produitId) {
        const stock = await prisma.stock.findFirst({
            where: {
                checkpointId: checkpointId,
                produitId: produitId
            }
        })
        return stock
    }

    static async insertMulitple(data) {
        const stock = await prisma.stock.createMany({
            data: data
        })
        return stock
    }

    static async updateByStockCheckpoint(data, checkpointId, produitId) {

        const stock = await prisma.stock.findFirst({
            where: {
                checkpointId: checkpointId,
                produitId: produitId
            }
        })

        if (stock != null) {
            await prisma.stock.update({
                where: { id: stock.id },
                data: {
                    ...data,
                    "updatedAt" : Datetime.now()
                }
            })
        }

        return stock
    }

    static async store(data) {
        const date = Datetime.now()
        const stock = await prisma.stock.create({
            data: {
                "value" : data.value,
                "produitId" : data.produitId,
                "checkpointId" : data.checkpointId,
                "createdAt" : date,
                "updatedAt" : date
            }
        })
        return stock
    }

    static async update(data) {
        const stock = await prisma.stock.update({
            data: {
                "produitId": data.produitId,
                "value": data.value,
                "updatedAt": Datetime.now()
            },
            where: { id: data.id }
        })
        return stock
    }
}

export default StockService