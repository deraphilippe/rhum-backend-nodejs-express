import { PrismaClient } from "@prisma/client";
import Datetime from "../utils/datetime.js";


const prisma = new PrismaClient();

class CheckpointService {
    static async findAll() {
        const checkpoints = await prisma.checkpoint.findMany()
        return checkpoints
    }

    static async findGreaterThan(id, column) {
        const checkpoints = await prisma.checkpoint.findMany({
            where: {
                [column]: {
                    gt: id
                },
            }
        })
        return checkpoints
    }

    static async store(data) {
        const date = Datetime.now()
        const checkpoint = await prisma.checkpoint.create({
            data: {
                "name" : data.name,
                "createdAt" : date,
                "updatedAt" : date
            }
        })
        return checkpoint
    }

    static async update(data) {
        const checkpoint = await prisma.checkpoint.update({
            data: {
                "name" : data.name,
                "updatedAt" : Datetime.now(),
            },
            where : {
                "id" : data.id
            }
        })
        return checkpoint
    }
}

export default CheckpointService