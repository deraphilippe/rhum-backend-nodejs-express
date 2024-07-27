import { PrismaClient } from "@prisma/client";
import Datetime from "../utils/datetime.js";


const prisma = new PrismaClient();

class ClientService {
    static async findAll() {
        const clients = await prisma.client.findMany()
        return clients
    }

    static async findById(id) {
        const client = await prisma.client.findFirst({
            where: {
                id: id
            }
        })
        return client
    }

    static async findGreaterThan(date, column, { user }) {
        var where = {
            [column]: {
                gt: Datetime.parse(date)
            }
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
        
        const clients = await prisma.client.findMany({
            where: where
        })
        return clients
    }

    static async findWithStock() {
        const clients = await prisma.client.findMany({
            include: {
                stock: true
            }
        })
        return clients
    }

    static async store(data) {
        const client = await prisma.client.create({
            data: {
                "id" : data.id,
                "nom" : data.nom,
                "phone" : data.phone,
                "userId" : data.userId,
                "createdAt" : Datetime.now(),
                "updatedAt" : Datetime.now()
            }
        })
        return client
    }

    static async update(data) {
        const client = await prisma.client.update({
            data: {
                "nom": data.nom,
                "phone": data.phone,
                "updatedAt": Datetime.now()
            },
            where: { id: data.id }
        })
        return client
    }
}

export default ClientService