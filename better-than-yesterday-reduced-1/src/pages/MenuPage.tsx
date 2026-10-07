import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { restaurantService } from '@/services/restaurantService';
import { MenuItem } from '@/types/restaurant';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Search, 
  ShoppingBag, 
  Info, 
  LayoutGrid, 
  Table as TableIcon, 
  Sparkles, 
  Plus, 
  Minus,
  Utensils,
  CheckCircle2
} from 'lucide-react';

const CATEGORIES = [
  'All Offerings',
  'Breakfast Specials',
  'Lunch Combos',
  'Dinner Delights',
  'Desserts & Beverages'
];

export const MenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Offerings');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'All' | 'Veg' | 'Non-Veg' | 'Dessert-Beverage'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Dish Detail Dialog state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  const { addToCart, setIsCartOpen, tableNumber } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await restaurantService.getMenuItems();
        setItems(data);
      } catch (err) {
        console.error('Failed to load menu', err);
        toast.error('Could not load menu items. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Filtered Items
  const filteredItems = items.filter((item) => {
    // Category match
    if (selectedCategory !== 'All Offerings' && item.category !== selectedCategory) {
      return false;
    }
    // Search match
    if (searchQuery.trim() && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Dietary match
    if (dietaryFilter === 'Veg' && item.dietary !== 'Veg') return false;
    if (dietaryFilter === 'Non-Veg' && item.dietary !== 'Non-Veg') return false;
    if (dietaryFilter === 'Dessert-Beverage' && item.dietary !== 'Beverage' && item.dietary !== 'Dessert') return false;

    return true;
  });

  const handleOpenDetail = (item: MenuItem) => {
    setSelectedItem(item);
    setModalQuantity(1);
  };

  const handleAddToCart = (item: MenuItem, quantity = 1) => {
    addToCart(item, quantity);
    toast.success(`Added ${quantity}x ${item.title} to tray!`);
    if (selectedItem) {
      setSelectedItem(null);
    }
    setIsCartOpen(true);
  };

  return (
    <MainLayout>
      {/* Menu Banner */}
      <section className="bg-[#101015] text-white py-14 border-b border-[#22222B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <Badge className="bg-[#C9A96E]/20 text-[#C9A96E] border-[#C9A96E]/30 text-xs px-3 py-1">
            Carefully Prepared Every Day
          </Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight">
            Our Menu
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-[#C9A96E]">
            &ldquo;Life cooked you. Our menu heals you.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto font-light">
            <span className="font-semibold text-white">Warning:</span> Choosing just one dish is impossible. Check out our breakfast specials, lunch combos, dinner delights, and cooling desserts below.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Controls Bar: Search & View Toggles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search dishes (e.g. Masala Dosa, Biriyani, Cake)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-background border-border"
            />
          </div>

          {/* Dietary filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <Button
              size="sm"
              variant={dietaryFilter === 'All' ? 'default' : 'outline'}
              onClick={() => setDietaryFilter('All')}
              className="rounded-full h-8 px-3 text-xs"
            >
              All Types
            </Button>
            <Button
              size="sm"
              variant={dietaryFilter === 'Veg' ? 'default' : 'outline'}
              onClick={() => setDietaryFilter('Veg')}
              className="rounded-full h-8 px-3 text-xs text-primary border-primary/30"
            >
              Pure Veg
            </Button>
            <Button
              size="sm"
              variant={dietaryFilter === 'Non-Veg' ? 'default' : 'outline'}
              onClick={() => setDietaryFilter('Non-Veg')}
              className="rounded-full h-8 px-3 text-xs text-destructive border-destructive/30"
            >
              Non-Veg
            </Button>
            <Button
              size="sm"
              variant={dietaryFilter === 'Dessert-Beverage' ? 'default' : 'outline'}
              onClick={() => setDietaryFilter('Dessert-Beverage')}
              className="rounded-full h-8 px-3 text-xs text-accent border-accent/30"
            >
              Dessert &amp; Drinks
            </Button>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center ml-2 border border-border rounded-lg p-0.5 bg-muted/30">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-background shadow-xs text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                title="Grid Gallery View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-background shadow-xs text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                title="Traditional Menu Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border/40">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-accent text-accent-foreground shadow-sm font-semibold'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border border-border/60 p-8 space-y-3">
            <Utensils className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <h3 className="font-serif text-lg font-semibold text-foreground">No dishes found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn&apos;t find any items matching &ldquo;{searchQuery}&rdquo;. Try adjusting your search or category filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Offerings');
                setDietaryFilter('All');
              }}
              className="mt-2 text-accent border-accent/40"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* GRID VIEW */}
        {!loading && viewMode === 'grid' && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="group overflow-hidden rounded-xl border border-border/70 hover:border-accent/60 transition-all duration-300 hover:shadow-xl bg-card flex flex-col justify-between"
              >
                {/* Image */}
                <div 
                  className="relative aspect-[4/3] overflow-hidden bg-muted cursor-pointer"
                  onClick={() => handleOpenDetail(item)}
                >
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {item.is_bestseller && (
                      <Badge className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
                        Best Seller
                      </Badge>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-background/90 text-foreground backdrop-blur-xs">
                      {item.category.split(' ')[0]}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="font-serif font-bold text-base bg-background/95 text-foreground px-2.5 py-1 rounded-md shadow-md">
                      {item.currency}{item.price}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => handleOpenDetail(item)}
                        className="font-serif font-semibold text-base text-foreground group-hover:text-accent transition-colors cursor-pointer"
                      >
                        {item.title}
                      </h3>
                      <span
                        className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                          item.dietary === 'Non-Veg' ? 'bg-destructive' : 'bg-primary'
                        }`}
                        title={item.dietary}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {item.description || 'Prepared fresh with signature authentic spices and traditional homestyle care.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenDetail(item)}
                      className="text-xs text-muted-foreground hover:text-accent flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item, 1)}
                      className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-8 px-3 rounded-full gap-1.5 shadow-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Order to Table</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* TABLE VIEW (Preserving the original st.boys.html table structure with modern elegance) */}
        {!loading && viewMode === 'table' && filteredItems.length > 0 && (
          <div className="bg-card rounded-xl border border-border/70 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border/60 bg-muted/20 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-semibold text-base text-foreground">Menu Catalog</h3>
                <p className="text-xs text-muted-foreground">Original menu directory with meal times, dish names, and prices</p>
              </div>
              <span className="text-xs font-medium text-accent">
                {filteredItems.length} dishes
              </span>
            </div>

            <div className="w-full max-w-full overflow-x-auto bg-card">
              <table className="w-full text-left text-sm border-collapse [&>div]:max-w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-xs font-serif uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4 whitespace-nowrap">Meal Time / Category</th>
                    <th className="py-3 px-4 whitespace-nowrap">Dish Name</th>
                    <th className="py-3 px-4 whitespace-nowrap">Dietary</th>
                    <th className="py-3 px-4 whitespace-nowrap">Price</th>
                    <th className="py-3 px-4 whitespace-nowrap text-right">Order Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-serif font-medium text-xs text-foreground/80 whitespace-nowrap">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{item.title}</span>
                          {item.is_bestseller && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-accent/20 text-accent border-accent/30">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-xs ${item.dietary === 'Non-Veg' ? 'text-destructive font-medium' : 'text-primary'}`}>
                          <span className={`w-2 h-2 rounded-full ${item.dietary === 'Non-Veg' ? 'bg-destructive' : 'bg-primary'}`} />
                          {item.dietary || 'Veg'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-accent whitespace-nowrap">
                        {item.currency}{item.price}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(item, 1)}
                          className="bg-accent/15 text-accent hover:bg-accent hover:text-accent-foreground text-xs h-7 px-3 rounded-full gap-1 font-semibold"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Order to Table</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* DISH DETAIL MODAL */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem && (
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg p-0 overflow-hidden bg-card border-border">
            <div className="relative aspect-video w-full bg-muted overflow-hidden">
              <img
                src={selectedItem.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className="bg-accent text-accent-foreground text-xs font-semibold">
                  {selectedItem.category}
                </Badge>
                {selectedItem.is_bestseller && (
                  <Badge variant="outline" className="bg-background text-foreground text-xs">
                    Best Seller
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <DialogHeader className="text-left space-y-1">
                <div className="flex items-center justify-between">
                  <DialogTitle className="font-serif text-xl sm:text-2xl text-foreground font-bold">
                    {selectedItem.title}
                  </DialogTitle>
                  <span className="font-serif text-xl font-bold text-accent">
                    {selectedItem.currency}{selectedItem.price}
                  </span>
                </div>
                <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${selectedItem.dietary === 'Non-Veg' ? 'bg-destructive' : 'bg-primary'}`} />
                  <span>{selectedItem.dietary || 'Pure Vegetarian'} Preparation</span>
                </DialogDescription>
              </DialogHeader>

              <p className="text-sm text-foreground/80 leading-relaxed">
                {selectedItem.description || 'Prepared fresh daily with authentic regional spices, slow cooking techniques, and genuine hospitality.'}
              </p>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Made to order in our hygienic kitchen with fresh ingredients.</span>
              </div>

              {/* Quantity Selector & Add Button */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <div className="flex items-center border border-border rounded-lg bg-muted/30">
                  <button
                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                    className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-bold min-w-[32px] text-center">
                    {modalQuantity}
                  </span>
                  <button
                    onClick={() => setModalQuantity(modalQuantity + 1)}
                    className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  onClick={() => handleAddToCart(selectedItem, modalQuantity)}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order {modalQuantity} to {tableNumber} (₹{(selectedItem.price * modalQuantity).toFixed(2)})</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </MainLayout>
  );
};
