'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
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
      <p className='py-10 text-center text-sm text-muted-foreground'>
        Loading session…
      </p>
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
    <div className='mx-auto max-w-md space-y-6 py-16'>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-semibold'>Create your workspace</h1>
        <p className='text-sm text-muted-foreground'>
          We map every tenant to your Somnia address. Give it a name that your
          operators recognize.
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='space-y-4 rounded-xl border border-border bg-card p-6'
        >
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
    </div>
  )
}
