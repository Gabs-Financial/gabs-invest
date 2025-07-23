import AnchorAccountApi from "./anchor-account.api";
import AnchorBillsApi from "./anchor-bills-api";
import AnchorCounterParty from "./anchor-counterparty.api";
import AnchorCustomerApi from "./anchor-customer-api";
import AnchorPaymentsApi from "./anchor-payments.api";



const anchor_account_api = new AnchorAccountApi()
const anchor_customer_api = new AnchorCustomerApi()
const anchor_bills_api = new AnchorBillsApi()
const anchor_payments_api = new AnchorPaymentsApi()
const anchor_counterparty_api = new AnchorCounterParty()


export default{
    account:anchor_account_api,
    customer:anchor_customer_api,
    bills: anchor_bills_api,
    payments: anchor_payments_api,
    counterparty: anchor_counterparty_api
}