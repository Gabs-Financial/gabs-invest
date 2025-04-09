import AnchorAccountApi from "./anchor-account.api";
import AnchorCustomerApi from "./anchor-customer-api";



const anchor_account_api = new AnchorAccountApi()
const anchor_customer_api = new AnchorCustomerApi()


export {
    anchor_account_api,
    anchor_customer_api
}