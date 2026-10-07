import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Utensils, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal, isCartOpen, setIsCartOpen, tableNumber } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 bg-card">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-accent" />
              <SheetTitle className="font-serif text-lg text-foreground">
                Table Order Cart
              </SheetTitle>
            </div>
            <Badge variant="outline" className="border-accent text-accent text-xs font-bold gap-1">
              <QrCode className="w-3 h-3" />
              {tableNumber}
            </Badge>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Dishes will be sent straight to the kitchen for your table.
          </SheetDescription>
        </SheetHeader>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Utensils className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-base font-semibold text-foreground">Your table cart is empty</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Explore our menu to add authentic South Indian specials, biriyanis, parottas, and beverages!
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCartOpen(false)}
                asChild
                className="mt-2 text-xs"
              >
                <Link to="/menu">Browse Menu</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-border bg-background flex items-center gap-3"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-14 h-14 rounded-md object-cover border border-border shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">{item.title}</h4>
                    <div className="text-xs font-semibold text-accent mt-0.5">
                      ₹{item.price} each
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-muted/60 p-1 rounded-md border border-border">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-card text-muted-foreground hover:text-foreground text-xs"
                      aria-label="Decrease quantity"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-3 h-3 text-destructive" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-card text-muted-foreground hover:text-foreground text-xs"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-border bg-card space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Selected items</span>
              <span className="font-medium text-foreground">{totalItems} dishes</span>
            </div>

            <div className="flex items-center justify-between font-bold text-base text-foreground">
              <span>Total Amount</span>
              <span className="font-serif text-xl text-accent">₹{subtotal}</span>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                size="lg"
                onClick={() => setIsCartOpen(false)}
                asChild
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold gap-2 text-sm shadow-md"
              >
                <Link to="/order">
                  <span>Send to Kitchen ({tableNumber})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <div className="flex justify-between items-center pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
                >
                  Clear Cart
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCartOpen(false)}
                  asChild
                  className="text-xs text-accent hover:underline h-7 px-2"
                >
                  <Link to="/menu">+ Add More Dishes</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
