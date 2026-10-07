import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ChefLogo } from '@/components/common/ChefLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { restaurantService } from '@/services/restaurantService';
import { MenuItem } from '@/types/restaurant';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { 
  Utensils, 
  Calendar, 
  Sparkles, 
  Flame, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ShoppingBag, 
  Star, 
  HeartHandshake, 
  Smile, 
  QrCode,
  CheckCircle2,
  Navigation
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [bestSellers, setBestSellers] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsCartOpen, tableNumber } = useCart();

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const items = await restaurantService.getMenuItems();
        const popular = items.filter(i => i.is_bestseller);
        setBestSellers(popular);
      } catch (err) {
        console.error('Error loading bestsellers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  const handleOrderNow = (item: MenuItem) => {
    addToCart(item, 1);
    toast.success(`Added ${item.title} to your table order tray!`);
    setIsCartOpen(true);
  };

  return (
    <MainLayout>
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0A0A0E] text-white">
        {/* Subtle Luxury Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80"
            alt="Oops! Life Cooked Again Ambiance"
            className="w-full h-full object-cover object-center filter grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0E] via-[#0A0A0E]/70 to-transparent" />
        </div>

        {/* Ambient Warm Golden Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 py-16 sm:py-24 text-center max-w-4xl">
          
          {/* Official Emblem Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
              <ChefLogo size="sm" />
            </div>
          </div>

          {/* Primary Original Tagline */}
          <p className="font-serif italic text-lg sm:text-2xl text-accent/90 mb-3 tracking-wide">
            &ldquo;Life cooked you. So we cooked for you.&rdquo;
          </p>

          {/* Big Brand Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Oops! Life <span className="text-accent underline decoration-accent/40 decoration-wavy underline-offset-8">Cooked Again</span>
          </h1>

          {/* Secondary Subtitle */}
          <p className="font-serif italic text-base sm:text-xl text-white/80 max-w-2xl mx-auto mb-8 font-light">
            &ldquo;Life cooked you. Our menu heals you.&rdquo;
          </p>

          {/* Seated Table Order Callout Banner */}
          <div className="mb-8 p-3 sm:p-4 rounded-2xl bg-white/10 border border-accent/40 backdrop-blur-md max-w-xl mx-auto text-left flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <span className="font-bold text-accent block text-sm">Sitting at a Dining Table?</span>
              <span className="text-white/80">Skip the waiter! Select dishes &amp; place your order straight to our kitchen from your phone.</span>
            </div>
            <Link to="/order" className="shrink-0">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs rounded-full">
                Order ({tableNumber})
              </Button>
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/order" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold px-8 rounded-full text-sm sm:text-base shadow-lg shadow-accent/20 gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Table Order (Sit &amp; Order)</span>
              </Button>
            </Link>

            <Link to="/reservation" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 rounded-full text-sm sm:text-base gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Table</span>
              </Button>
            </Link>

            <Link to="/menu" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="lg"
                className="w-full border border-white/60 text-white hover:bg-white/10 px-8 rounded-full text-sm sm:text-base gap-2"
              >
                <Utensils className="w-4 h-4" />
                <span>Explore Full Menu</span>
              </Button>
            </Link>
          </div>

          {/* Quick Operating Info Strip */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span>06:00 AM - 10:00 PM (Sun–Fri)</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span>St. Joseph&apos;s College, Trichy-620002</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-accent" />
              <span>Saturday Closed for Kitchen Sanitation</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. THE STORY / ABOUT SECTION (Preserving exact original text) */}
      <section className="py-16 md:py-24 bg-card border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* Story Visual Frame */}
            <div className="md:col-span-5 relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
                  alt="Friends Cooking at Oops! Life Cooked Again"
                  className="w-full h-full object-cover filter contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="font-serif text-accent text-xs font-semibold tracking-wider uppercase">
                    Friends-Owned &amp; Operated
                  </span>
                  <p className="font-serif font-bold text-lg leading-snug">
                    Endless cravings turned into a culinary sanctuary.
                  </p>
                </div>
              </div>

              {/* Floating Chef Badge */}
              <div className="absolute -bottom-4 -right-4 bg-background border border-accent/40 rounded-xl p-3 shadow-xl hidden sm:flex items-center gap-3">
                <ChefLogo size="sm" />
                <div>
                  <span className="text-[10px] text-muted-foreground block">Founded by Friends</span>
                  <span className="text-xs font-serif font-bold text-accent">Cooked aGain</span>
                </div>
              </div>
            </div>

            {/* Story Copy */}
            <div className="md:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Founding Story</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Where Great Food Meets Great Friendships
              </h2>

              <blockquote className="border-l-2 border-accent pl-4 font-serif italic text-base sm:text-lg text-foreground/90">
                &ldquo;Oops! Life Cooked Again&rdquo; is a friends-owned restaurant where great food meets great friendships.
              </blockquote>

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                We&apos;re just a bunch of friends who love food and decided to turn our endless cravings into a restaurant. A few days ago, Oops! Life Cooked Again was born with one goal—to serve tasty food, share good vibes, and create happy memories.
              </p>

              <div className="p-4 rounded-xl bg-muted/60 border border-border/80">
                <p className="font-serif font-bold text-accent text-base sm:text-lg tracking-wide">
                  &ldquo;We cook food better than your life.&rdquo;
                </p>
              </div>

              {/* Core Values Pill Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                  <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <span>Friends Hospitality</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                  <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                    <Smile className="w-4 h-4" />
                  </div>
                  <span>Unfiltered Good Vibes</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                  <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <span>Piping Hot Tawa Specialties</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                  <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                    <Star className="w-4 h-4" />
                  </div>
                  <span>Student &amp; Family Friendly</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. BEST SELLERS SHOWCASE WITH REALISTIC DISH PHOTOGRAPHY */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold tracking-wider uppercase mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Chef&apos;s Signature Selection</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Original Best Sellers
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                The crowd favorites from our authentic South Indian kitchen.
              </p>
            </div>

            <Link to="/menu" className="self-start sm:self-auto">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <span>View All 20+ Dishes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Cards Grid with Realistic Food Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
              ))
            ) : bestSellers.length > 0 ? (
              bestSellers.map((item) => (
                <Card
                  key={item.id}
                  className="group overflow-hidden border-border bg-card hover:border-accent/50 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <Badge className="bg-accent text-accent-foreground font-bold text-[10px] px-2 py-0.5 shadow-sm">
                        Best Seller
                      </Badge>
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 backdrop-blur-md bg-black/60 text-white border-none">
                        {item.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif font-bold text-base text-foreground group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                        <span className="font-serif font-extrabold text-accent text-base shrink-0">
                          ₹{item.price}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleOrderNow(item)}
                      className="w-full mt-auto bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Table Order</span>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : null}
          </div>

        </div>
      </section>

      {/* 4. SEATED TABLE ORDERING HIGHLIGHT */}
      <section className="py-12 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-gradient-to-r from-card via-card to-card/90 border border-accent/40 rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold">
                <QrCode className="w-3.5 h-3.5" />
                <span>Instant In-Restaurant Table Ordering</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Seated at Table? Order Food in Seconds
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Just sit down, choose your table number, browse our delicious menu, and dispatch your order directly to the kitchen. Track your order live while you chat with friends.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  No waiting in line
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Direct kitchen ticket
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Pay after meal
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
              <Link to="/order" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold px-6 rounded-xl shadow-lg shadow-accent/20 gap-2">
                  <QrCode className="w-4 h-4" />
                  <span>Start Table Order</span>
                </Button>
              </Link>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full border-border rounded-xl text-xs sm:text-sm gap-2">
                  <Navigation className="w-4 h-4 text-accent" />
                  <span>Find Restaurant</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GUEST FEEDBACK TEASER BANNER (Original Quote) */}
      <section className="py-16 md:py-20 bg-background text-center">
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
          <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto">
            <Star className="w-6 h-6 fill-accent" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            &ldquo;Life cooked you again? Tell us if we cooked it better!&rdquo;
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Your reviews and opinions mean the world to our kitchen crew. Read what other diners say or leave your honest dining rating.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/feedback">
              <Button size="lg" className="bg-primary text-primary-foreground font-semibold px-6 rounded-full text-xs sm:text-sm">
                Share Your Dining Feedback
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="px-6 rounded-full text-xs sm:text-sm">
                View Location &amp; Hours
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </MainLayout>
  );
};
