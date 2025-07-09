"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Loader2, PlusCircle } from "lucide-react"
import { createCustomer } from "@/lib/actions/customer.actions"
import { useRouter } from "next/navigation"
const FormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Must be a valid email address"
  }),
  phoneNumber: z.string().regex(
    /^[\d\s+()-]{7,20}$/,
    'Must be a valid phone number'
  ),
  password: z.string().min(6, {
    message: "Password must be at least 6 or more characters"
  }),
  addresses: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zipCode: z.string(),
  })
})
const CustomerForm = () => {
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      addresses: {
        street: "",
        state: "",
        city: "",
        country: "",
        zipCode: ""
      }
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await createCustomer(data)
      form.reset();
      router.refresh();
      toast.success("Register Successfully", {
        description: "Customer was registered successfully"
      })

    } catch (error) {
      console.log(error)
      toast.error("Something went wrong", {
        description: "Please try again later"
      })
    }
  }
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button size="sm"><PlusCircle className="w-4 h-4" /> Add Client</Button>
        </DialogTrigger>
        <DialogContent className="w-[96%] md:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
            <DialogDescription>
              Fill in the customer details below. Click save when you’re done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-5 space-y-6">
              <h2 className="font-bold text-xl">Bio Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="eg. John Doe" {...field} />
                      </FormControl>
                      <FormDescription>
                        Add customer full Name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="eg. johndoe@email.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Add customer email address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="eg. John Doe" {...field} />
                      </FormControl>
                      <FormDescription>
                        Add customer phone number.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormDescription>
                        Add a simple Password for customer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <h2 className="font-bold text-xl">Addresses</h2>
                <div className="grid grid-col-1 md:grid-cols-3 gap-4">

                  <FormField
                    control={form.control}
                    name="addresses.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="eg. Suame" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="addresses.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="eg. Kumasi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="addresses.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="eg. Market street 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="addresses.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="eg. Ghana" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="addresses.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="eg. 00233" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Button disabled={isSubmitting} type="submit">
                {
                  isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting ..
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Submit
                    </>
                  )
                }
              </Button>
            </form>
          </Form>
        </DialogContent>
      </form>
    </Dialog >
  )
}

export default CustomerForm