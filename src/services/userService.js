import { PrismaClient } from "@prisma/client";
import Datetime from "../utils/datetime.js";


const prisma = new PrismaClient();

class UserService {
    static async findAll() {
        const users = await prisma.users.findMany()
        return users
    }

    static async findUnique(args) {
        const user = await prisma.users.findUnique({
            where: {
                phone: args.phone,
            },
            include : {
                checkpoint : true
            }
        })
        return user
    }

    static async findGreaterThan(id, column) {
        const users = await prisma.users.findMany({
            where: {
                [column]: {
                    gt: id
                },
            }
        })
        return users
    }

    static async store(data) {
        const date = Datetime.now()
        const user = await prisma.users.create({
            data: {
                ...data,
                "updatedAt" : date,
                "createdAt" : date

            }
        })
        return user
    }

    static async update(data) {
        const user = await prisma.users.update({
            data: {
                "name" : data.name,
                "phone" : data.phone,
                "password" : data.password,
                "updatedAt" : Datetime.now()
            },
            where : {
                id : data.id
            }
        })
        return user
    }
}

export default UserService