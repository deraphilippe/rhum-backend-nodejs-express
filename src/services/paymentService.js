import { PrismaClient } from "@prisma/client";
import Datetime from "../utils/datetime.js";


const prisma = new PrismaClient();

class PaymentService {
    static async findAll() {
        const payments = await prisma.payment.findMany()
        return payments
    }    
    
    static async findGreaterThan(date, column, { user }) {
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
        
        
        const payments = await prisma.payment.findMany({
            where: where
        })
        return payments
    }

    static async store(data, user) {
        const date = Datetime.now()
        const payment = await prisma.payment.create({
            data: {
                "montant" : data.montant,
                "userId" : user.id,
                "createdAt" : date,
                "updatedAt" : date
            }
        })
        return payment
    }

    static async update(data) {
        const payment = await prisma.payment.update({
            data: {
                "montant" : data.montant,
                "updatedAt" : Datetime.now()
            },
            where: { id: data.id }
        })
        return payment
    }
}

export default PaymentService