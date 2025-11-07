
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, initiateEmailSignUp, initiateEmailSignIn } from '@/firebase';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FlaskConical, Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    // Non-blocking approach: initiate the auth action and let the
    // onAuthStateChanged listener in the provider handle the redirect.
    if (isSignUp) {
      initiateEmailSignUp(auth, values.email, values.password);
      toast({
        title: 'Creating Account...',
        description: 'You will be redirected shortly.',
      });
    } else {
      initiateEmailSignIn(auth, values.email, values.password);
      toast({
        title: 'Signing In...',
        description: 'You will be redirected shortly.',
      });
    }
    
    // We don't await here. The auth listener will redirect.
    // However, we can add a fallback redirect after a short delay.
    setTimeout(() => {
        // This is a fallback in case the listener is slow to react.
        if (auth.currentUser) {
            router.push('/admin');
        } else {
            // If still not logged in, the listener will eventually show an error or the user needs to try again.
            setIsLoading(false);
            toast({
                variant: 'destructive',
                title: 'Authentication Failed',
                description: 'Please check your credentials and try again.',
            });
        }
    }, 2500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-primary/10 text-primary p-3 rounded-full">
              <FlaskConical className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="font-headline text-2xl">{isSignUp ? 'Create Admin Account' : 'Admin Login'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Enter your details to create a new account.' : 'Enter your credentials to access the dashboard.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
