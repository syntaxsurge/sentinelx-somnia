'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'

const schema = z.object({
  name: z.string().min(2, 'Name is required').max(48)
})

export default function OnboardingPage() {
  const { user, loading } = useSession()
  const ensureTenant = useMutation(api.tenants.ensureTenant)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' }
  })

  useEffect(() => {
    if (!loading && !user?.address) {
      router.replace('/')
    }
  }, [loading, router, user?.address])

  if (loading) {
    return (
      <Card className='mx-auto max-w-md'>
        <CardContent className='py-12 text-center text-sm text-muted-foreground'>
          Preparing onboarding…
        </CardContent>
      </Card>
    )
  }

  if (!user?.address) {
    return null
  }

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    await ensureTenant({ owner: user.address, name: values.name })
    toast({ title: 'Workspace created', description: values.name })
    router.push('/dashboard')
  }

  return (
    <div className='mx-auto max-w-lg'>
      <Card>
        <CardHeader className='space-y-2 text-center'>
          <CardTitle className='text-3xl'>Create your workspace</CardTitle>
          <CardDescription>
            Each tenant maps to your wallet address. Name it for your Somnia
            operators and start registering monitors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace name</FormLabel>
                    <FormControl>
                      <Input placeholder='Somnia Index Vaults' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' className='w-full'>
                Continue
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
