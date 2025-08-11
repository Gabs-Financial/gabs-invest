import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import axiosClient, { AxiosErrorResponse } from "@/lib/axios-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthProvider";

const Register: React.FC<React.ComponentPropsWithoutRef<"form">> = ({ className, ...props }) => {
  const navigate = useNavigate();

  const formSchema = z.object({
    firstName: z.string().trim(),
    lastName: z.string(),
    email: z.string().trim().email().min(1, {
      message: "Email is required",
    }),
    password: z.string().trim().min(6, {
      message: "Password length must be greater than 6",
    }),
    phoneNumber:z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions to continue",
    }),
  });

  type RegisterFormValues = z.infer<typeof formSchema>;

  const {setCredentials} = useAuth()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
 
    mode: "all"
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const response = await axiosClient.post("/auth/register", data)
      return response
    },
    onSuccess: (data) => {
      toast.success(data.data?.message)
      setCredentials(data?.data.data.user, data?.data.data.accessToken)
      navigate("/verify_email")
    },
    onError: (error) => {
      const err = error as AxiosErrorResponse;
      const errorMessage = err.response?.data.message || "An error occurred";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    mutate(data);
  };

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Register your account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Let's get you started with your TagPay account.
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className=" text-sm">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className=" text-sm">First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className=" text-sm">Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className=" text-sm">Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+234" {...field} inputMode="numeric" type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className=" text-sm flex items-center">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />{" "}
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Accept Terms and Condition</FormLabel>
                    <FormDescription>
                      You agree to our Terms of Service and Privacy Policy.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />{" "}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!form.formState.isValid}
          >
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Creating your account" : "Register"}
          </Button>
        </div>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/" className="underline underline-offset-4">
            Login
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default Register;
