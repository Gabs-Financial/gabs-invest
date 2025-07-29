import { eq } from "drizzle-orm";
import { ErrorCode } from "../../@types/errorCode.enum";
import db from "../../db/connectDb";
import { accounts } from "../../db/schema/account.model";
import { portfolio } from "../../db/schema/portfolio.model";
import { BadRequestException } from "../../utils/error";
import { systemLogger } from "../../utils/logger";
import { CreateInvestmentType, CreatePortfolioProfileType } from "./portfolio.types";
import { assets } from "../../db/schema/mutalFunds.model";
import { setup } from "../../db/schema/setup.model";


type PortfolioInsertType = typeof portfolio.$inferInsert

class PortfolioServices {


    public async createPortfolioProfile(data: CreatePortfolioProfileType, userId: string) {

        const { averageMonthlyIncome, employmentStatus, investmentFrequency, investmentHorizon, investmentObjectives, portfolioType, riskTolerance, sourceOfIncome, autoInvest, portfolioAssests } = data

        await db.transaction(async (tx) => {


            const portfolioProfilePayload: PortfolioInsertType = {
                employment_status: employmentStatus,
                investment_frequency: investmentFrequency,
                auto_invest: autoInvest,
                user_id: userId,
                monthly_income: averageMonthlyIncome,
                investment_horizon: investmentHorizon,
                investment_objectives: [investmentObjectives],
                portfolio_type: portfolioType,
                source_of_income:sourceOfIncome,
                preferred_assets: portfolioAssests,
            }

            await tx.insert(portfolio).values(portfolioProfilePayload)
            await tx.update(setup).set({ has_created_portfolio_profile: true }).where(eq(setup.user_id, userId))




        })


    }


    public async createInvestment(data:CreateInvestmentType, userId:string) {

        
        // Retrieve User Account
        const [userAccount] = await db.select().from(accounts).where(eq(accounts.user_id, userId));

        if (!userAccount) {
            throw new BadRequestException("Account cannot be found", ErrorCode.AUTH_NOT_FOUND);
        }

        // Check Account Status
        if (userAccount.status === "blocked") {
            throw new BadRequestException("This account has been blocked from processing transactions", ErrorCode.ACCESS_UNAUTHORIZED);
        }

        // Check Sufficient Balance
        if (userAccount.balance < data.amount) {
            systemLogger.info(`Insufficient funds for user with accountId ${userAccount.id}`);
            throw new BadRequestException("Insufficient Funds", ErrorCode.BAD_REQUEST);
        }


        // fetch assest by 
        
        await db.transaction(async(tx) => {

            const [asset] = await tx.select().from(assets).where(eq(assets.id, data.assetId))

            if(!asset || asset.status) {
                throw new BadRequestException("Asset not found or unavailable", ErrorCode.AUTH_NOT_FOUND)
            }


            


        })


    }


}


const portfolioServices = new PortfolioServices()
export default portfolioServices