'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Building2, Loader2, Rocket, Shield } from 'lucide-react'

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
  FormDescription,
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
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(48, 'Workspace name must be less than 48 characters')
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
      <div className='flex min-h-[60vh] items-center justify-center'>
        <Card className='mx-auto w-full max-w-lg border-border/60'>
          <CardContent className='flex flex-col items-center py-16'>
            <Loader2 className='h-12 w-12 animate-spin text-primary mb-4' />
            <p className='text-sm font-medium text-foreground'>Preparing onboarding</p>
            <p className='text-xs text-muted-foreground mt-1'>Setting up your workspace...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user?.address) {
    return null
  }

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await ensureTenant({ owner: user.address, name: values.name })
      toast({
        title: 'Workspace created successfully',
        description: `Welcome to ${values.name}! Redirecting to your dashboard...`
      })
      setTimeout(() => router.push('/dashboard'), 500)
    } catch (error) {
      toast({
        title: 'Error creating workspace',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className='flex min-h-[80vh] items-center justify-center py-12'>
      <div className='mx-auto w-full max-w-2xl space-y-8 px-4'>
        <div className='text-center space-y-4'>
          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20'>
            <Rocket className='h-8 w-8 text-primary' />
          </div>
          <div className='space-y-2'>
            <h1 className='text-4xl font-bold tracking-tight text-foreground'>
              Welcome to SentinelX
            </h1>
            <p className='text-lg text-muted-foreground max-w-xl mx-auto'>
              Let's create your workspace to start monitoring Somnia oracles and protecting your smart contracts
            </p>
          </div>
        </div>

        <Card className='border-border/60 shadow-lg'>
          <CardHeader className='space-y-3 pb-6'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20'>
                <Building2 className='h-5 w-5 text-primary' />
              </div>
              <div>
                <CardTitle className='text-2xl'>Create your workspace</CardTitle>
                <CardDescription className='mt-1'>
                  Your workspace will be linked to your wallet address
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-6'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-base'>Workspace name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., Somnia Index Vaults'
                          className='h-12 text-base'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Choose a name that represents your organization or project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='rounded-lg bg-muted/50 border border-border/60 p-4 space-y-3'>
                  <div className='flex items-start gap-3'>
                    <Shield className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
                    <div className='space-y-1'>
                      <p className='text-sm font-medium text-foreground'>
                        Connected wallet
                      </p>
                      <p className='text-xs font-mono text-muted-foreground break-all'>
                        {user.address}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type='submit'
                  size='lg'
                  className='w-full h-12 text-base'
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Creating workspace...
                    </>
                  ) : (
                    'Create workspace'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
