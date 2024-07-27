import { PrismaClient } from "@prisma/client";
import SortieService from "./sortieService.js";
import StockService from "./stockService.js";
import Datetime from "../utils/datetime.js";


const prisma = new PrismaClient();

class CommandeService {
    static async findAll() {
        const commandes = await prisma.commande.findMany({
            include: {
                payment: true,
                sortie: true
            }
        })
        return commandes
    }

    static async findById(id) {
        const commande = await prisma.commande.findUnique({
            where: { id: id }
        })
        return commande
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

        const commandes = await prisma.commande.findMany({
            where: where
        })
        return commandes
    }

    static async store(data, user) {
        const date = Datetime.now()
        let value = {
            id: data.id,
            clientId: data.clientId,
            paiement: data.paiement,
            dateLiv: data.dateLiv,
            montant: data.montant,
            userId: user.id,
            createdAt : date,
            updatedAt : date
        }

        const commande = await prisma.commande.create({
            data: value
        })

        if (data.sorties != undefined) {
            // Ajout des sorties
            const sorties = data.sorties.map((sortie) => ({
                ...sortie,
                commandeId: commande.id,
                userId: user.id
            }))
            await SortieService.store(sorties, user, false)

            // Modification des stocks
            for (var i = 0; i < data.sorties.length; i++) {
                const produitId = data.sorties[i].produitId
                const quantite = data.sorties[i].quantite
                if (data.sorties[i].apply == 1) {
                    const stock = await StockService.findByCheckpointId(user.checkpoint.id, produitId)
                    StockService.updateByStockCheckpoint({ value: stock.value - quantite }, user.checkpoint.id, produitId)
                }
            }
        }

        return commande
    }

    static async update(data) {
        let value = {
            clientId: data.clientId,
            paiement: data.paiement,
            dateLiv: data.dateLiv,
            montant: data.montant,
            updatedAt : Datetime.now()
        }

        const commande = await prisma.commande.update({
            data: value,
            where: {
                id: data.id
            }
        })

        if (data.sorties != undefined) {
            // Modification des sorties
            for (let i = 0; i < data.sorties.length; i++) {
                await SortieService.update(data.sorties[i])
            }
        }

        return commande
    }
}

export default CommandeService