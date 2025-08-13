import { AxiosResponse } from "axios";
import axiosClient, { ApiResponse } from "../axios-client";
import { ECustomer } from "../entities/customer.entity";




const fetchAllCustomers = async (): Promise<AxiosResponse<ApiResponse<ECustomer[]>>> => await axiosClient.get('/customers')
const fetchCustomerById = async (customerId:string): Promise<AxiosResponse<ApiResponse<ECustomer>>> => await axiosClient.get(`/customers/${customerId}`)

const customers =  {
    fetchAllCustomers,
    fetchCustomerById
}

export default customers