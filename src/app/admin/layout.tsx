

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarHeader, SidebarTrigger, SidebarRail, SidebarInset } from '@/components/ui/sidebar';
import { Users, BarChart, NotebookPen, ShieldCheck, SlidersHorizontal, Loader2, ListCollapse } from 'lucide-react';
import Header from '@/components/common/Header';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1">
          <Sidebar>
            <SidebarContent>
              <SidebarHeader>
                <SidebarTrigger />
              </SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/admin'}
                    tooltip="Session Management"
                  >
                    <Link href="/admin">
                      <Users />
                      Session Management
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/admin/analysis'}
                    tooltip="Data Analysis"
                  >
                    <Link href="/admin/analysis">
                      <BarChart />
                      Data Analysis
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/admin/descriptives'}
                    tooltip="Descriptive Statistics"
                  >
                    <Link href="/admin/descriptives">
                      <ListCollapse />
                      Descriptives
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/admin/manual-coding'}
                    tooltip="Manual Coding"
                  >
                    <Link href="/admin/manual-coding">
                      <NotebookPen />
                      Manual Coding
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/admin/quality'}
                    tooltip="Data Quality"
                  >
                    <Link href="/admin/quality">
                      <ShieldCheck />
                      Data Quality
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/admin/la-pipeline'}
                    tooltip="LA Pipeline"
                  >
                    <Link href="/admin/la-pipeline">
                      <SlidersHorizontal />
                      LA Pipeline
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <main className="flex-1 p-4 md:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
