import { AxiosResponse } from "axios";
import axiosClient, { ApiResponse } from "../axios-client";




const fetchAllCustomers = async (): Promise<AxiosResponse<ApiResponse<{data: ''}>>> => await axiosClient.get('/customers')


const customers =  {
    fetchAllCustomers
}

export default customers