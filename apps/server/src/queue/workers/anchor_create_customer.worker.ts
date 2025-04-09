import { Job, MetricsTime, Worker } from "bullmq"
import { connection, QueueRegistry } from "../queue-registry"
import redis from "../../config/redis.config"
import { anchor_customer_api } from "../../providers/anchor/anchor.modules"
import { systemLogger } from "../../utils/logger"
import db from "../../db/connectDb"
import { CustomerData } from "../../providers/anchor/anchor.types"
import { user } from "../../db/schema/user.model"
import { ProvidersType } from "../../services/user/user.types"
import { eq } from "drizzle-orm"



const Anchor_createCustomerWorker = new Worker(QueueRegistry.create_anchor_customer, async (job: Job) => {

     const data: CustomerData<'level_2'> = job.data

    try {

        await db.transaction( async(tx) => {


            // Find user 

            const customer = await tx.query.user.findFirst({ where: eq(user.id, data.userId) })

            if (!customer) {
                tx.rollback()
                throw new Error(`Customer with ID ${data.userId} not found`)
            }

            const response = await anchor_customer_api.createCustomer({
                ...job.data
            }, "IndividualCustomer", 'level_2')



            if (response.status === 200 || 202) {
                 tx.rollback()
                throw new Error(response.data.errors )
            }


           

            const providerPayload: ProvidersType = {
                ...(typeof customer.providers === 'object' && customer.providers !== null ? customer.providers : {}),
                anchor_provider_id: response.data?.data.id
            }

         const [updatedCustomer] =  await tx.update(user).set({providers: providerPayload, kyc_level: 1}).returning({
            providers: user.providers,
            id: user.id
         })


          
         return updatedCustomer


        })


     
        
        

    } catch (error) {
        console.log(error)
        systemLogger.error(error)
    }


    return job.data

}, {
    connection: connection,
    metrics: {
        maxDataPoints: MetricsTime.ONE_WEEK * 2,
    },
    removeOnComplete: {
        age: 60,
    },
    autorun: false,
})


Anchor_createCustomerWorker.on('completed', async (job) => {



})


Anchor_createCustomerWorker.on("error", (err) => {

    console.log(err.message, "this is the error error")


})


Anchor_createCustomerWorker.on("failed", (job) => {

    console.log("this failed")

})


export default Anchor_createCustomerWorker