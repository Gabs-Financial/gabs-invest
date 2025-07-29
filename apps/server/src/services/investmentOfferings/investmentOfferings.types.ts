import { z } from "zod";


const CreateInvestmentOfferringSchema  = z.object({
    category:z.enum(["mutual_funds",""])
})