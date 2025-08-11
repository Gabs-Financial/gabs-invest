import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyEmail: React.FC<React.ComponentPropsWithoutRef<"form">> = ({
  className,
  ...props
}) => {
  const navigate = useNavigate();

  const formSchema = z.object({
    code: z.string().trim(),
  });

  type VerifyEmailValues = z.infer<typeof formSchema>;

  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: VerifyEmailValues) => {
      const response = await axiosClient.post("/auth/verify_email", data);

      return response;
    },
    onSuccess: (data) => {
      toast.success(data?.data.message);
      navigate("/app/onboarding");
    },
    onError: (error) => {
      const err = error as AxiosErrorResponse;
      const errorMessage = err.response?.data.message || "An error occurred";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: VerifyEmailValues) => {
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
          <h1 className="text-2xl font-bold">Verify your email address</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter the code sent to your email .
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center">
                {/* <FormLabel>Verification Token</FormLabel> */}
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                {/* <FormDescription>
                  Please enter the one-time password sent to your phone.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={!form.formState.isValid}
          >
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Verifying your email" : "Verify Email"}
          </Button>
        </div>
        <div className="text-center text-sm">
          Go back to{" "}
          <Link to="/" className="underline underline-offset-4">
            Login
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default VerifyEmail;
