'use client';

import Link from 'next/link';
import { FlaskConical, LogOut } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center justify-between bg-transparent">
      <Link href="/" className="flex items-center justify-center" prefetch={false}>
        <FlaskConical className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold text-primary font-headline">Advisory Insights</span>
      </Link>
      {!isUserLoading && user && (
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
          <LogOut className="h-5 w-5" />
        </Button>
      )}
    </header>
  );
}
