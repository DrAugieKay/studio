import Link from 'next/link';
import { FlaskConical } from 'lucide-react';

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-transparent">
      <Link href="/" className="flex items-center justify-center" prefetch={false}>
        <FlaskConical className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold text-primary font-headline">Advisory Insights</span>
      </Link>
    </header>
  );
}
