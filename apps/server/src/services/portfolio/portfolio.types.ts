import { z } from "zod"



const createPorfolioProfileSchema = z.object({

    employmentStatus: z.enum(["Employed", "Unemployed", "Self-Employed"]),
    investmentObjectives: z.string().min(1, "Investment objective is required"),
    sourceOfIncome: z.string().min(1, "Source of income is required"),
    investmentHorizon: z.enum(["short", "medium", "long"]),
    averageMonthlyIncome: z.number(),
    riskTolerance: z.enum(["high", "moderate", "low"]),
    investmentFrequency: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
    portfolioAssests: z.string().array().optional(),
    autoInvest: z.boolean().optional(),
    portfolioType: z.enum(["single", "multi"]),
})


const createInvestmentSchema = z.object({
    assetId: z.string(),
    amount: z.number()
})


export type CreateInvestmentType = z.infer<typeof createInvestmentSchema>
export type CreatePortfolioProfileType = z.infer<typeof createPorfolioProfileSchema>