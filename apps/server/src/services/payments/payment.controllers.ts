import { Request, Response } from "express";
import { HTTPSTATUS } from "../../config/statusCode.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import AnchorMiacApi from "../../providers/anchor/anchor-miac-api";


export const fetchBankListController = asyncHandler( async(req:Request, res: Response) => {


    const response = await AnchorMiacApi.fetchBankList()

const { data }: { data: { id: string; attributes: { name: string; nipCode: string } }[] } = response.data;

    const formattedData = data.map((bank: { id: string; attributes: { name: string; nipCode: string } }) => {
        return {
            id: bank.id,
            label: bank.attributes.name,
            value: bank.attributes.nipCode,
        };
    })

    console.log(formattedData, "this is the formatted ")
  
    return res.status(HTTPSTATUS.CREATED).json({
        success: true,
        message: "Bank List fetched successfully",
        data: formattedData,
    })

})