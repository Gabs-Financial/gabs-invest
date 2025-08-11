import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { CustomerColumns, customers } from "./CustomerColumnDef";


const CustomersPage = () => {
  return (
    <div className="gap-6 flex flex-col">
      {/* header */}
      <div className="flex-row flex justify-between items-center  ">
        <h4>Customers</h4>
        <div className="flex-row flex">
          <Sheet>
            <SheetTrigger>
              <Button className="text-sm text-white" size={"sm"}>
                New Customer
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Are you absolutely sure?</SheetTitle>
                <SheetDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* analtics card section */}
      <AnalyticsCard title="Total Customers" value="12,304" />

      {/*  customer table */}
      <DataTable columns={CustomerColumns} data={customers}/>
    </div>
  );
};

export default CustomersPage;

type AnalyticsCardProps = {
  title: string;
  value: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

function AnalyticsCard({
  title,
  value,
  action,
  footer,
  className = "",
}: AnalyticsCardProps) {
  return (
    <Card className={`max-w-[250px] w-full  ${className}`}>
      <CardHeader>
        <CardDescription>{title}</CardDescription>

        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>

        {action && <CardAction>{action}</CardAction>}
      </CardHeader>

      {footer && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}