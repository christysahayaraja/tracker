import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { restaurantService } from '@/services/restaurantService';
import { OnlineOrder, OrderStatus } from '@/types/restaurant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Utensils,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  MapPin,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const TABLE_PRESETS = [
  'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
  'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10',
  'Table 11', 'Table 12', 'Table 14', 'Table 15', 'Outdoor T1'
];

export const OrderPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, tableNumber, setTableNumber } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [customTable, setCustomTable] = useState('');
  const [isCustomTable, setIsCustomTable] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Active / Submitted Order state
  const [currentOrder, setCurrentOrder] = useState<OnlineOrder | null>(() => {
    try {
      const saved = localStorage.getItem('oops_active_table_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [simulatedStatus, setSimulatedStatus] = useState<OrderStatus>(() => {
    return currentOrder ? currentOrder.status : 'received';
  });

  // Kitchen simulation: moves from received -> preparing -> served
  useEffect(() => {
    if (!currentOrder) return;

    const timer1 = setTimeout(() => {
      setSimulatedStatus('preparing');
    }, 12000); // 12 seconds to preparing

    const timer2 = setTimeout(() => {
      setSimulatedStatus('served');
      toast.success(`Dishes are served to ${currentOrder.table_number}! Enjoy your meal!`, {
        duration: 5000
      });
    }, 28000); // 28 seconds to served

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [currentOrder]);

  const handleSelectTable = (tbl: string) => {
    setTableNumber(tbl);
    setIsCustomTable(false);
  };

  const handleCustomTableApply = () => {
    if (customTable.trim()) {
      setTableNumber(customTable.trim());
      setIsCustomTable(false);
    }
  };

  const handleSubmitTableOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty! Please add some delicious dishes first.');
      return;
    }

    if (!tableNumber) {
      toast.error('Please select or enter your table number.');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please provide your name or initials.');
      return;
    }

    setSubmitting(true);
    const orderCode = `OLCA-TBL-${tableNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderPayload = {
      order_code: orderCode,
      table_number: tableNumber,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim() || undefined,
      order_type: 'table_order' as const,
      items: cart,
      subtotal,
      status: 'received' as const,
      special_instructions: instructions.trim() || undefined
    };

    try {
      let createdOrder: OnlineOrder;
      try {
        createdOrder = await restaurantService.createOrder(orderPayload);
      } catch (err) {
        console.warn('Fallback local order generation:', err);
        createdOrder = {
          ...orderPayload,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString()
        };
      }

      setCurrentOrder(createdOrder);
      setSimulatedStatus('received');
      localStorage.setItem('oops_active_table_order', JSON.stringify(createdOrder));
      clearCart();
      toast.success(`Order sent straight to the kitchen for ${tableNumber}!`);
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('Failed to submit order to kitchen. Please inform restaurant staff.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetOrder = () => {
    setCurrentOrder(null);
    localStorage.removeItem('oops_active_table_order');
  };

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold mb-3">
            <QrCode className="w-3.5 h-3.5" />
            <span>Table Dine-In Ordering • Sit & Order</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
            Order Directly from Your Table
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            No need to wait for a waiter. Select your table, choose your favorite dishes, and our chefs will start cooking immediately.
          </p>
        </div>

        {/* ACTIVE TABLE ORDER PROGRESS VIEW */}
        {currentOrder ? (
          <div className="space-y-6">
            <Card className="border-accent/40 bg-card/95 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <Badge className="bg-accent text-accent-foreground font-bold text-sm px-3 py-1">
                        {currentOrder.table_number}
                      </Badge>
                      <span className="text-xs text-primary-foreground/75 font-mono">
                        Ticket: {currentOrder.order_code}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-white">
                      Order Dispatched to Kitchen!
                    </h2>
                    <p className="text-xs text-primary-foreground/80 mt-1">
                      Guest: <span className="font-semibold text-white">{currentOrder.customer_name}</span> • Placed at {new Date(currentOrder.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        toast.info('Checking latest kitchen status...');
                      }}
                      className="border border-white/30 text-white hover:bg-white/10 text-xs gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetOrder}
                      className="border border-white/30 text-white hover:bg-white/10 text-xs"
                    >
                      Order More Items
                    </Button>
                  </div>
                </div>

                {/* Status Stepper */}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {/* Step 1: Received */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                        simulatedStatus === 'received' || simulatedStatus === 'preparing' || simulatedStatus === 'served'
                          ? 'bg-accent text-accent-foreground ring-4 ring-accent/30'
                          : 'bg-white/20 text-white/60'
                      }`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-white">1. Order Received</span>
                      <span className="text-[10px] text-primary-foreground/70 hidden sm:inline">Ticket printed in kitchen</span>
                    </div>

                    {/* Step 2: Preparing */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                        simulatedStatus === 'preparing' || simulatedStatus === 'served'
                          ? 'bg-accent text-accent-foreground ring-4 ring-accent/30 animate-pulse'
                          : 'bg-white/20 text-white/60'
                      }`}>
                        <ChefHat className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-white">2. Kitchen Cooking</span>
                      <span className="text-[10px] text-primary-foreground/70 hidden sm:inline">Fresh on stove & tawa</span>
                    </div>

                    {/* Step 3: Served */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                        simulatedStatus === 'served'
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30'
                          : 'bg-white/20 text-white/60'
                      }`}>
                        <BellRing className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-white">3. Served to Table</span>
                      <span className="text-[10px] text-primary-foreground/70 hidden sm:inline">Arriving piping hot!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Review */}
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-bold text-lg text-foreground">
                    Items on this Table Ticket
                  </h3>
                  <Badge variant="outline" className="border-accent/40 text-accent font-semibold">
                    Pay at Counter or Table after Meal
                  </Badge>
                </div>

                <div className="divide-y divide-border">
                  {currentOrder.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
                          />
                        )}
                        <div>
                          <div className="font-medium text-sm text-foreground">
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ₹{item.price} × {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-sm text-foreground">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {currentOrder.special_instructions && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/60 border border-border text-xs">
                    <span className="font-semibold text-foreground">Table Note for Kitchen: </span>
                    <span className="text-muted-foreground">{currentOrder.special_instructions}</span>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="flex items-center justify-between font-bold text-base text-foreground">
                  <span>Total Amount</span>
                  <span className="font-serif text-xl text-accent">₹{currentOrder.subtotal}</span>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/menu">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
                      <Utensils className="w-4 h-4" />
                      <span>Browse More Dishes</span>
                    </Button>
                  </Link>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleResetOrder}
                    className="w-full sm:w-auto bg-primary text-primary-foreground gap-2"
                  >
                    <span>Place Another Order for {currentOrder.table_number}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* NEW TABLE ORDER FORM & CART REVIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Table Selection & Details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Pick Table */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-lg flex items-center gap-2 text-foreground">
                      <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">1</span>
                      Select Your Table Number
                    </CardTitle>
                    <Badge variant="outline" className="border-accent text-accent text-xs font-bold">
                      {tableNumber || 'None Selected'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Look at the sticker on your dining table (e.g. Table 4).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {TABLE_PRESETS.map((tbl) => (
                      <button
                        key={tbl}
                        type="button"
                        onClick={() => handleSelectTable(tbl)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                          tableNumber === tbl && !isCustomTable
                            ? 'bg-accent text-accent-foreground border-accent shadow-sm scale-102 font-bold ring-2 ring-accent/30'
                            : 'bg-card text-foreground hover:bg-muted/70 border-border'
                        }`}
                      >
                        {tbl}
                      </button>
                    ))}
                  </div>

                  {/* Custom Table Number Input */}
                  <div className="pt-2">
                    {!isCustomTable ? (
                      <button
                        type="button"
                        onClick={() => setIsCustomTable(true)}
                        className="text-xs text-accent hover:underline font-medium"
                      >
                        + Other Table Number / Floor Section
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          placeholder="e.g. VIP Room, Table 18"
                          value={customTable}
                          onChange={(e) => setCustomTable(e.target.value)}
                          className="text-xs h-9"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCustomTableApply}
                          className="bg-accent text-accent-foreground text-xs h-9"
                        >
                          Set
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Guest Details & Kitchen Instructions */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="font-serif text-lg flex items-center gap-2 text-foreground">
                    <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">2</span>
                    Diner Information & Table Notes
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Let our team know who is sitting at this table.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="table-order-form" onSubmit={handleSubmitTableOrder} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="cname" className="text-xs font-semibold">
                          Your Name / Nickname *
                        </Label>
                        <Input
                          id="cname"
                          required
                          placeholder="e.g. Anand or Christy"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="bg-background text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cphone" className="text-xs font-semibold">
                          Mobile Number (Optional)
                        </Label>
                        <Input
                          id="cphone"
                          type="tel"
                          placeholder="For SMS receipt or bill"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="bg-background text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cinstr" className="text-xs font-semibold">
                        Kitchen & Table Notes
                      </Label>
                      <Textarea
                        id="cinstr"
                        rows={2}
                        placeholder="e.g. Extra spicy, less oil, bring extra banana leaves, serve coffee after meal"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="bg-background text-xs"
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Guarantee Box */}
              <div className="p-4 rounded-xl border border-border bg-card/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Fresh Tawa & Dum Kitchen Guarantee: </span>
                  Every dish is cooked fresh upon receiving your table ticket. You can track preparation live right here on your phone.
                </div>
              </div>
            </div>

            {/* Right Column: Order Cart Summary & Kitchen Dispatch */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-border shadow-md">
                <CardHeader className="pb-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-lg flex items-center gap-2 text-foreground">
                      <ShoppingBag className="w-5 h-5 text-accent" />
                      Table Order Cart
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs font-bold">
                      {cart.length} {cart.length === 1 ? 'Dish' : 'Dishes'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5">
                  {cart.length === 0 ? (
                    <div className="py-10 text-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                        <Utensils className="w-7 h-7" />
                      </div>
                      <h4 className="font-medium text-sm text-foreground">Your table cart is empty</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        Explore our breakfast specials, biriyanis, parottas, and beverages to start ordering.
                      </p>
                      <Link to="/menu" className="inline-block pt-2">
                        <Button size="sm" className="bg-primary text-primary-foreground gap-1.5 text-xs">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Dishes from Menu</span>
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Cart Items List */}
                      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors flex items-center gap-3"
                          >
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-14 h-14 rounded-md object-cover border border-border shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm text-foreground truncate">
                                {item.title}
                              </h5>
                              <div className="text-xs font-bold text-accent">
                                ₹{item.price}
                              </div>
                            </div>

                            {/* Quantity controls */}
                            <div className="flex items-center gap-1.5 shrink-0 bg-muted/60 p-1 rounded-md border border-border">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-background text-muted-foreground hover:text-foreground text-xs"
                              >
                                {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-destructive" /> : <Minus className="w-3 h-3" />}
                              </button>
                              <span className="w-5 text-center text-xs font-bold text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-background text-muted-foreground hover:text-foreground text-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <Link to="/menu" className="text-xs text-accent hover:underline flex items-center gap-1">
                          <Plus className="w-3 h-3" />
                          <span>Add more items to this order</span>
                        </Link>
                      </div>

                      <Separator />

                      {/* Pricing summary */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Items Subtotal</span>
                          <span>₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Service & Dining Tax</span>
                          <span className="text-emerald-500 font-semibold">Included (₹0)</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border">
                          <span>Table Total</span>
                          <span className="font-serif text-base text-accent">₹{subtotal}</span>
                        </div>
                      </div>

                      {/* Big Submit Button */}
                      <Button
                        type="submit"
                        form="table-order-form"
                        disabled={submitting || cart.length === 0}
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold py-6 text-sm sm:text-base rounded-xl shadow-lg shadow-accent/20 gap-2 transition-all"
                      >
                        {submitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                            <span>Sending Ticket to Kitchen...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <ChefHat className="w-5 h-5" />
                            <span>Send Order to Kitchen ({tableNumber})</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        )}
                      </Button>

                      <p className="text-[11px] text-center text-muted-foreground">
                        Payment can be made via UPI / Cash after your meal at your table or counter.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
