import { useNavigate, useParams } from "react-router";
import { customers } from "./CustomerColumnDef";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeCheckIcon, ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CustomerDetails = () => {
  const { customerId } = useParams();

  const customer = customers.find((i) => i.id === customerId);

  return (
    <div className="max-w-[1200px] mx-auto w-full p-5 gap-10 flex flex-col">
      {/* customer details card */}
      <div className="border dark:border-neutral-700 rounded-lg">
        {/* header */}
        <div className="border-b dark:border-neutral-700 px-5 py-3 flex flex-row justify-between items-center">
          <div className="flex gap-2 items-end">
            <div>
              <span className="text-xs dark:text-neutral-400">Id</span>
              <h3 className="text-lg">{customer?.id}</h3>
            </div>
            <Badge
              variant={
                customer?.status === "active" ? "success" : "destructive"
              }
              className="uppercase "
            >
              {customer?.status}
            </Badge>
          </div>

          <Button
            size={"sm"}
            className="flex items-center justify-center text-white "
          >
            Actions
            <ChevronDown />
          </Button>
        </div>
        {/* body */}
        <div
          className="
    p-4 
    grid gap-5 
    grid-cols-1 
    sm:grid-cols-2 
    md:grid-cols-3 
    lg:grid-cols-5 
    xl:grid-cols-5
  "
        >
          {/* full name */}
          <div className="gap-1 flex-col flex">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Full Name
            </span>
            <h3 className="font-semibold capitalize">{customer?.full_name}</h3>
          </div>

          {/* phone number */}
          <div className="gap-1 flex-col flex">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Phone Number
            </span>
            <h3 className="font-semibold capitalize">
              {customer?.phone_number}
            </h3>
          </div>

          {/* email */}
          <div className="gap-1 flex-col flex">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Email
            </span>
            <h3 className="font-semibold">{customer?.email}</h3>
          </div>

          {/* gabs tag */}
          <div className="gap-1 flex-col flex">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Gabs Tag
            </span>
            <h3 className="font-semibold">{customer?.gabs_tag}</h3>
          </div>

          {/* gender */}
          <div className="gap-1 flex-col flex">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Gender
            </span>
            <h3 className="font-semibold">{customer?.gender}</h3>
          </div>

          {/* onboarded */}
          <div className="gap-1 flex-col flex">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Onboarded
            </span>
            <Badge
              variant={customer?.has_onboarded ? "default" : "destructive"}
            >
              {customer?.has_onboarded && <BadgeCheckIcon />}
              {customer?.has_onboarded ? "True" : "False"}
            </Badge>
          </div>

          {/* kyc */}
          <div className="gap-1 flex-col flex">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Kyc Tier
            </span>
            <h3 className="font-semibold capitalize">{customer?.kyc_level}</h3>
          </div>

          {/* date created */}
          <div className="gap-1 flex-col flex">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Date Created
            </span>
            <h3 className="font-semibold ">
              {dayjs(customer?.created_at).format("DD/MMM/YYYY")}
            </h3>
          </div>
        </div>
      </div>

      {/* customer balance details */}
      <div
        className="border dark:border-neutral-700 rounded-lg p-4  grid gap-5 
    grid-cols-1 
    sm:grid-cols-2 
    md:grid-cols-3 
    lg:grid-cols-3 
    xl:grid-cols-3"
      >
        {/* Available balance */}
        <div className="gap-1 flex-col flex border-r dark:border-neutral-700">
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            Available Balance
          </span>
          <h3 className="font-semibold ">
            {" "}
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 0,
            }).format(100000 || 0)}
          </h3>
        </div>
        <div className="gap-1 flex-col flex border-r dark:border-neutral-700">
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            Total Investments
          </span>
          <h3 className="font-semibold capitalize">{customer?.kyc_level}</h3>
        </div>
        <div className="gap-1 flex-col flex border-r dark:border-neutral-700">
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            Total Transactions
          </span>
          <h3 className="font-semibold capitalize">{customer?.kyc_level}</h3>
        </div>
      </div>

      {/* data table and tabs */}
      <CustomerDataTable />
    </div>
  );
};

export default CustomerDetails;


const CustomerDataTable = () =>  {


  return (
    <div className="gap-2">
      <Tabs defaultValue="transactions" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="investments">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );

}