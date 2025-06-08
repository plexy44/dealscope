
import Link from 'next/link';
import type { HTMLProps } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends Omit<HTMLProps<HTMLAnchorElement>, 'href'> {
  // className prop will be part of HTMLProps<HTMLAnchorElement>
}

const Logo: React.FC<LogoProps> = ({ className, ...props }) => {
  return (
    <Link 
      href="/" 
      className={cn(
        "text-3xl font-headline font-bold text-primary hover:text-accent transition-colors",
        className // Allow overriding or extending base styles
      )}
      {...props}
    >
      dealscope
    </Link>
  );
};

export default Logo;
