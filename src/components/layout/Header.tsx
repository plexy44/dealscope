
"use client";
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
// UserNav import removed
import { useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Header = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

  const viewFromUrl = searchParams?.get('view') || 'deals';

  useEffect(() => {
    setSearchTerm(searchParams?.get('q') || '');
  }, [searchParams]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams?.toString());
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    } else {
      params.delete('q');
    }
    // view parameter is already handled by tabs and kept in URL by searchParams.toString()
    router.push(`/?${params.toString()}`);
  };

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('view', view);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="ml-4 flex items-center">
          <Logo />
        </div>
        
        <div className="ml-8 flex items-center">
          <Tabs value={viewFromUrl} onValueChange={handleViewChange} className="w-auto">
            <TabsList className="bg-muted p-1 rounded-lg">
              <TabsTrigger 
                value="deals" 
                className="px-4 py-1.5 data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-sm text-sm"
              >
                Deals
              </TabsTrigger>
              <TabsTrigger 
                value="auctions" 
                className="px-4 py-1.5 data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-sm text-sm"
              >
                Auctions
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2"> {/* Adjusted space-x if needed */}
          <form onSubmit={handleSearchSubmit} className="flex flex-1 max-w-xs ml-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
                className="w-full rounded-lg bg-muted pl-10 pr-4 py-2 focus:bg-background text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="ghost" size="icon" className="ml-2 text-foreground hover:text-primary"> {/* Changed hover color */}
              <Search className="h-5 w-5" />
            </Button>
          </form>
          {/* UserNav component removed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
