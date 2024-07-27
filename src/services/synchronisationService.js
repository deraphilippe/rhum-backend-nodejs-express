import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

class SynchronisationService {
    static async findAll() {
        const synchronisations = await prisma.synchronisation.findMany()
        return synchronisations
    }

    static async findLastInserted() {
        
    }

    static async update(data) {
        const synchronisation = await prisma.synchronisation.findFirst({
            where : {
                userId : data.userId,
                tableName : data.tableName,
                typeSync : data.typeSync
            }
        })

        if(synchronisation==null) {
            await prisma.synchronisation.create({
                data : data,

            })
        }
        else {
            await prisma.synchronisation.update({
                data : {
                    value : data.value
                },
                where : {
                    id : synchronisation.id
                }
            })
        }
    }
}

export default SynchronisationService