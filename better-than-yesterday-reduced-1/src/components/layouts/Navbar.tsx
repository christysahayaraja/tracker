import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefLogo } from '@/components/common/ChefLogo';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu as MenuIcon,
  ShoppingBag,
  CalendarDays,
  UtensilsCrossed,
  MapPin,
  MessageSquare,
  ShieldAlert,
  Home,
  QrCode
} from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Menu', path: '/menu', icon: UtensilsCrossed },
  { name: 'Table Order', path: '/order', icon: QrCode, highlight: true },
  { name: 'Book Table', path: '/reservation', icon: CalendarDays },
  { name: 'Reviews', path: '/feedback', icon: MessageSquare },
  { name: 'Hours & Location', path: '/contact', icon: MapPin },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { totalItems, setIsCartOpen, tableNumber } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center group transition-transform active:scale-95">
          <ChefLogo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-accent font-semibold bg-accent/10 border border-accent/30 shadow-sm'
                    : link.highlight
                    ? 'text-foreground hover:text-accent font-semibold bg-accent/5 hover:bg-accent/15 border border-accent/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive || link.highlight ? 'text-accent' : 'text-muted-foreground'}`} />
                <span>{link.name}</span>
                {link.highlight && (
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Table Indicator Badge */}
          <Link to="/order" className="hidden sm:flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold">
            <QrCode className="w-3 h-3" />
            <span>{tableNumber || 'Table Order'}</span>
          </Link>

          {/* Cart Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCartOpen(true)}
            className="relative border border-accent/40 text-accent hover:bg-accent/10 px-3 gap-1.5 rounded-full"
            aria-label="View table order cart"
          >
            <ShoppingBag className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-foreground">Cart</span>
            {totalItems > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-accent-foreground bg-accent rounded-full shadow-sm">
                {totalItems}
              </span>
            )}
          </Button>

          {/* Book Table CTA (Desktop) */}
          <Link to="/reservation" className="hidden sm:inline-block">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-4 rounded-full shadow-sm"
            >
              Reserve Table
            </Button>
          </Link>

          {/* Mobile Navigation Drawer Trigger */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 text-foreground"
                  aria-label="Open mobile navigation"
                >
                  <MenuIcon className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-xs flex flex-col p-6 bg-card">
                <SheetHeader className="text-left pb-4 border-b border-border">
                  <ChefLogo size="sm" showTagline />
                  <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                </SheetHeader>

                <div className="flex-1 py-4 flex flex-col gap-2">
                  {NAV_LINKS.map((link) => {
                    const isActive = location.pathname === link.path;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-accent/15 text-accent font-semibold border border-accent/30'
                            : 'text-foreground hover:bg-muted/80'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-accent" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <Link to="/reservation" onClick={() => setMobileOpen(false)} className="block w-full">
                    <Button className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md">
                      Reserve a Table
                    </Button>
                  </Link>

                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block w-full">
                    <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Staff & Admin Portal</span>
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>

      </div>
    </header>
  );
};
