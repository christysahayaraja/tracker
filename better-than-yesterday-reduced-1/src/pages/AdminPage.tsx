import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ChefLogo } from '@/components/common/ChefLogo';
import { restaurantService } from '@/services/restaurantService';
import { 
  MenuItem, 
  Reservation, 
  FeedbackReview, 
  OnlineOrder, 
  RestaurantSettings 
} from '@/types/restaurant';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  Calendar, 
  Utensils, 
  MessageSquareQuote, 
  Settings, 
  ShoppingBag, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Lock, 
  LogOut, 
  Clock, 
  Eye, 
  EyeOff, 
  Phone, 
  Mail, 
  MapPin,
  RefreshCw,
  Search
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('oops_admin_auth') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState('admin@lifecookedagain.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('reservations');

  // Data states
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<FeedbackReview[]>([]);
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [resFilter, setResFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [resSearch, setResSearch] = useState('');
  const [menuSearch, setMenuSearch] = useState('');

  // Menu Modal State
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState('Breakfast Specials');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemDietary, setItemDietary] = useState('Veg');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemIsBestseller, setItemIsBestseller] = useState(false);

  // Settings form state
  const [phoneSetting, setPhoneSetting] = useState('');
  const [emailSetting, setEmailSetting] = useState('');
  const [addressSetting, setAddressSetting] = useState('');
  const [aboutSetting, setAboutSetting] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch all admin data
  const loadData = async () => {
    setLoading(true);
    try {
      const [resData, menuData, revData, orderData, settsData] = await Promise.all([
        restaurantService.getReservations(),
        restaurantService.getMenuItems(),
        restaurantService.getFeedback(false),
        restaurantService.getOrders(),
        restaurantService.getSettings()
      ]);
      setReservations(resData);
      setMenuItems(menuData);
      setReviews(revData);
      setOrders(orderData);
      setSettings(settsData);

      if (settsData) {
        setPhoneSetting(settsData.phone || '');
        setEmailSetting(settsData.email || '');
        setAddressSetting(settsData.address || '');
        setAboutSetting(settsData.about_text || '');
      }
    } catch (err) {
      console.error('Error loading admin data', err);
      toast.error('Failed to load portal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@lifecookedagain.com' && adminPassword === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('oops_admin_auth', 'true');
      setLoginError('');
      toast.success('Welcome back, Chef & Admin!');
    } else {
      setLoginError('Invalid credentials. (Hint: use admin@lifecookedagain.com / admin123)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('oops_admin_auth');
    toast.info('Logged out from Admin portal');
  };

  // Quick Demo Login
  const handleQuickDemo = () => {
    setAdminEmail('admin@lifecookedagain.com');
    setAdminPassword('admin123');
    setIsAuthenticated(true);
    localStorage.setItem('oops_admin_auth', 'true');
    setLoginError('');
    toast.success('Signed in with Demo Credentials!');
  };

  // Reservation Status Update
  const handleUpdateReservationStatus = async (id: string, newStatus: Reservation['status']) => {
    try {
      await restaurantService.updateReservationStatus(id, newStatus);
      toast.success(`Reservation status updated to ${newStatus}`);
      setReservations(prev =>
        prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Order Status Update
  const handleUpdateOrderStatus = async (id: string, newStatus: OnlineOrder['status']) => {
    try {
      await restaurantService.updateOrderStatus(id, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  // Menu item create / update
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim() || !itemPrice) {
      toast.error('Please enter dish title and price');
      return;
    }

    try {
      if (editingItem && editingItem.id) {
        const updated = await restaurantService.updateMenuItem(editingItem.id, {
          title: itemTitle.trim(),
          category: itemCategory,
          price: parseFloat(itemPrice),
          description: itemDescription.trim() || undefined,
          dietary: itemDietary,
          image_url: itemImageUrl.trim() || undefined,
          is_bestseller: itemIsBestseller
        });
        setMenuItems(prev => prev.map(m => (m.id === updated.id ? updated : m)));
        toast.success('Dish updated successfully');
      } else {
        const created = await restaurantService.createMenuItem({
          title: itemTitle.trim(),
          category: itemCategory,
          price: parseFloat(itemPrice),
          currency: '₹',
          description: itemDescription.trim() || undefined,
          dietary: itemDietary,
          image_url: itemImageUrl.trim() || undefined,
          is_bestseller: itemIsBestseller,
          is_available: true,
          display_order: menuItems.length + 1
        });
        setMenuItems(prev => [...prev, created]);
        toast.success('New dish added to menu');
      }
      setMenuModalOpen(false);
      resetMenuModal();
    } catch (err) {
      toast.error('Error saving dish');
    }
  };

  const handleToggleMenuAvailability = async (item: MenuItem) => {
    try {
      const updated = await restaurantService.updateMenuItem(item.id, {
        is_available: !item.is_available
      });
      setMenuItems(prev => prev.map(m => (m.id === item.id ? updated : m)));
      toast.success(`${item.title} is now ${updated.is_available ? 'Available' : 'Out of Stock'}`);
    } catch (err) {
      toast.error('Error updating availability');
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      await restaurantService.deleteMenuItem(id);
      setMenuItems(prev => prev.filter(m => m.id !== id));
      toast.success('Dish removed');
    } catch (err) {
      toast.error('Error deleting dish');
    }
  };

  const openAddMenuModal = () => {
    setEditingItem(null);
    setItemTitle('');
    setItemCategory('Breakfast Specials');
    setItemPrice('');
    setItemDescription('');
    setItemDietary('Veg');
    setItemImageUrl('');
    setItemIsBestseller(false);
    setMenuModalOpen(true);
  };

  const openEditMenuModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemTitle(item.title);
    setItemCategory(item.category);
    setItemPrice(item.price.toString());
    setItemDescription(item.description || '');
    setItemDietary(item.dietary || 'Veg');
    setItemImageUrl(item.image_url || '');
    setItemIsBestseller(item.is_bestseller);
    setMenuModalOpen(true);
  };

  const resetMenuModal = () => {
    setEditingItem(null);
    setItemTitle('');
    setItemCategory('Breakfast Specials');
    setItemPrice('');
    setItemDescription('');
    setItemDietary('Veg');
    setItemImageUrl('');
    setItemIsBestseller(false);
  };

  // Feedback Toggle
  const handleToggleFeedback = async (review: FeedbackReview) => {
    if (!review.id) return;
    try {
      const updated = await restaurantService.toggleFeedbackApproval(review.id, !review.is_approved);
      setReviews(prev => prev.map(r => (r.id === review.id ? updated : r)));
      toast.success(`Review ${updated.is_approved ? 'Approved for public display' : 'Hidden'}`);
    } catch (err) {
      toast.error('Error moderating feedback');
    }
  };

  const handleDeleteFeedback = async (id?: string) => {
    if (!id || !confirm('Delete this feedback?')) return;
    try {
      await restaurantService.deleteFeedback(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Feedback deleted');
    } catch (err) {
      toast.error('Error deleting feedback');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await restaurantService.updateSettings({
        phone: phoneSetting.trim(),
        email: emailSetting.trim(),
        address: addressSetting.trim(),
        about_text: aboutSetting.trim()
      });
      setSettings(updated);
      toast.success('Restaurant information saved!');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered reservations
  const filteredReservations = reservations.filter(r => {
    if (resFilter !== 'all' && r.status !== resFilter) return false;
    if (resSearch.trim()) {
      const query = resSearch.toLowerCase();
      return (
        r.guest_name.toLowerCase().includes(query) ||
        r.reference_code.toLowerCase().includes(query) ||
        r.phone.includes(query)
      );
    }
    return true;
  });

  // Filtered menu
  const filteredMenu = menuItems.filter(m => {
    if (menuSearch.trim()) {
      return (
        m.title.toLowerCase().includes(menuSearch.toLowerCase()) ||
        m.category.toLowerCase().includes(menuSearch.toLowerCase())
      );
    }
    return true;
  });

  // If NOT authenticated, show refined login
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-muted/20">
          <Card className="w-full max-w-md border-border/80 shadow-2xl bg-card">
            <CardHeader className="text-center space-y-3 pb-4">
              <ChefLogo size="lg" variant="gold" className="justify-center" />
              <div>
                <CardTitle className="font-serif text-2xl font-bold">Staff &amp; Admin Portal</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Secure management console for Oops! Life Cooked Again.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive text-center">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-email" className="text-xs font-semibold">Staff Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-pwd" className="text-xs font-semibold">Password</Label>
                  <Input
                    id="admin-pwd"
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="bg-background text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold py-2.5"
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5" />
                  <span>Authenticate Session</span>
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground text-[10px]">
                    Quick Demo Access
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleQuickDemo}
                className="w-full text-xs border-accent/40 text-accent hover:bg-accent/10"
              >
                Instant 1-Click Demo Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Admin Header */}
      <section className="bg-[#101015] text-white py-8 border-b border-[#22222B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ChefLogo size="md" variant="gold" />
            <div className="border-l border-white/20 pl-3">
              <h1 className="font-serif text-xl sm:text-2xl font-bold">Restaurant Management Portal</h1>
              <p className="text-xs text-gray-400">Live control over bookings, catalog, orders and guest reviews</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="border border-white/40 text-white hover:bg-white/10 text-xs gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="text-xs gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 border-border/70 bg-card">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Total Reservations
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="font-serif text-2xl font-bold text-foreground">
                {reservations.length}
              </span>
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              {reservations.filter(r => r.status === 'pending').length} pending approval
            </span>
          </Card>

          <Card className="p-4 border-border/70 bg-card">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Online Orders
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="font-serif text-2xl font-bold text-foreground">
                {orders.length}
              </span>
              <ShoppingBag className="w-5 h-5 text-accent" />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Live orders received
            </span>
          </Card>

          <Card className="p-4 border-border/70 bg-card">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Menu Offerings
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="font-serif text-2xl font-bold text-foreground">
                {menuItems.length}
              </span>
              <Utensils className="w-5 h-5 text-accent" />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              {menuItems.filter(m => m.is_available).length} in stock
            </span>
          </Card>

          <Card className="p-4 border-border/70 bg-card">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Guest Feedback
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="font-serif text-2xl font-bold text-foreground">
                {reviews.length}
              </span>
              <MessageSquareQuote className="w-5 h-5 text-accent" />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              {reviews.filter(r => r.is_approved).length} publicly displayed
            </span>
          </Card>
        </div>

        {/* Tabbed Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/40 p-1 border border-border/50 rounded-xl grid grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="reservations" className="text-xs gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Bookings ({reservations.length})</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="text-xs gap-1.5">
              <Utensils className="w-3.5 h-3.5" />
              <span>Menu Catalog ({menuItems.length})</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs gap-1.5">
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>Feedback ({reviews.length})</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span>Settings &amp; Hours</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: RESERVATIONS */}
          <TabsContent value="reservations" className="space-y-4">
            <Card className="border-border/70 bg-card">
              <CardHeader className="p-4 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-serif text-lg">Table Reservations</CardTitle>
                  <CardDescription className="text-xs">
                    Confirm, reschedule or manage dining inquiries.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by code/name..."
                      value={resSearch}
                      onChange={(e) => setResSearch(e.target.value)}
                      className="h-8 pl-8 text-xs bg-background"
                    />
                  </div>

                  <Select value={resFilter} onValueChange={(val: any) => setResFilter(val)}>
                    <SelectTrigger className="h-8 text-xs w-32 bg-background">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="w-full max-w-full overflow-x-auto bg-card">
                  <table className="w-full text-left text-xs [&>div]:max-w-full">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/40 font-serif uppercase tracking-wider text-muted-foreground">
                        <th className="py-3 px-4 whitespace-nowrap">Code</th>
                        <th className="py-3 px-4 whitespace-nowrap">Guest</th>
                        <th className="py-3 px-4 whitespace-nowrap">Contact</th>
                        <th className="py-3 px-4 whitespace-nowrap">Date &amp; Time</th>
                        <th className="py-3 px-4 whitespace-nowrap">Party &amp; Seating</th>
                        <th className="py-3 px-4 whitespace-nowrap">Notes</th>
                        <th className="py-3 px-4 whitespace-nowrap">Status</th>
                        <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredReservations.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-muted-foreground">
                            No reservations found matching the filters.
                          </td>
                        </tr>
                      ) : (
                        filteredReservations.map((res) => (
                          <tr key={res.id || res.reference_code} className="hover:bg-muted/20">
                            <td className="py-3 px-4 font-mono font-bold text-accent whitespace-nowrap">
                              {res.reference_code}
                            </td>
                            <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                              {res.guest_name}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                              <div>{res.phone}</div>
                              <div className="text-[10px]">{res.email}</div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div>{res.reservation_date}</div>
                              <div className="text-muted-foreground">{res.reservation_time}</div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div>{res.guests_count} Guests</div>
                              <span className="text-[10px] text-muted-foreground capitalize">
                                {res.seating_preference}
                              </span>
                            </td>
                            <td className="py-3 px-4 max-w-[160px] truncate text-muted-foreground" title={res.additional_notes}>
                              {res.additional_notes || '—'}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <Badge
                                variant="outline"
                                className={`text-[10px] capitalize ${
                                  res.status === 'confirmed'
                                    ? 'bg-primary/10 text-primary border-primary/30'
                                    : res.status === 'completed'
                                    ? 'bg-accent/10 text-accent border-accent/30'
                                    : res.status === 'cancelled'
                                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                                    : 'bg-warning/10 text-warning border-warning/30'
                                }`}
                              >
                                {res.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {res.status !== 'confirmed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateReservationStatus(res.id!, 'confirmed')}
                                    className="h-7 px-2 text-[10px] text-primary hover:bg-primary/10"
                                  >
                                    Confirm
                                  </Button>
                                )}
                                {res.status !== 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateReservationStatus(res.id!, 'completed')}
                                    className="h-7 px-2 text-[10px] text-accent hover:bg-accent/10"
                                  >
                                    Complete
                                  </Button>
                                )}
                                {res.status !== 'cancelled' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUpdateReservationStatus(res.id!, 'cancelled')}
                                    className="h-7 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: ONLINE ORDERS */}
          <TabsContent value="orders" className="space-y-4">
            <Card className="border-border/70 bg-card">
              <CardHeader className="p-4 border-b border-border/40">
                <CardTitle className="font-serif text-lg">Online Kitchen Orders</CardTitle>
                <CardDescription className="text-xs">
                  Active takeaway and dine-in food requests from the online order tray.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full max-w-full overflow-x-auto bg-card">
                  <table className="w-full text-left text-xs [&>div]:max-w-full">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/40 font-serif uppercase tracking-wider text-muted-foreground">
                        <th className="py-3 px-4 whitespace-nowrap">Order Code</th>
                        <th className="py-3 px-4 whitespace-nowrap">Table #</th>
                        <th className="py-3 px-4 whitespace-nowrap">Customer</th>
                        <th className="py-3 px-4 whitespace-nowrap">Items &amp; Notes</th>
                        <th className="py-3 px-4 whitespace-nowrap">Total</th>
                        <th className="py-3 px-4 whitespace-nowrap">Status</th>
                        <th className="py-3 px-4 whitespace-nowrap text-right">Kitchen Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground">
                            No table orders placed yet. Seated guests will show up here.
                          </td>
                        </tr>
                      ) : (
                        orders.map((ord) => (
                          <tr key={ord.id || ord.order_code} className="hover:bg-muted/20">
                            <td className="py-3 px-4 font-mono font-bold text-accent whitespace-nowrap">
                              {ord.order_code}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <Badge className="bg-accent text-accent-foreground font-extrabold text-xs px-2.5 py-0.5">
                                {ord.table_number || 'Table 1'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-semibold text-foreground">{ord.customer_name}</div>
                              {ord.customer_phone && (
                                <div className="text-[10px] text-muted-foreground">{ord.customer_phone}</div>
                              )}
                            </td>
                            <td className="py-3 px-4 max-w-xs text-xs">
                              {ord.items.map((it, idx) => (
                                <span key={idx} className="block text-[11px] font-medium text-foreground">
                                  {it.quantity}x {it.title}
                                </span>
                              ))}
                              {ord.special_instructions && (
                                <span className="text-[10px] text-amber-500 font-medium block mt-1 bg-amber-500/10 p-1 rounded">
                                  Note: &ldquo;{ord.special_instructions}&rdquo;
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-serif font-bold text-accent whitespace-nowrap">
                              ₹{Number(ord.subtotal).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <Badge className={`text-[10px] capitalize font-bold ${
                                ord.status === 'received'
                                  ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                                  : ord.status === 'preparing'
                                  ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse'
                                  : ord.status === 'served'
                                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {ord.status === 'preparing' ? 'Cooking' : ord.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {ord.status === 'received' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateOrderStatus(ord.id!, 'preparing')}
                                    className="h-7 px-2 text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold"
                                  >
                                    Cook
                                  </Button>
                                )}
                                {ord.status === 'preparing' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateOrderStatus(ord.id!, 'served')}
                                    className="h-7 px-2 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                                  >
                                    Serve to Table
                                  </Button>
                                )}
                                {ord.status === 'served' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateOrderStatus(ord.id!, 'completed')}
                                    className="h-7 px-2 text-[10px] bg-accent text-accent-foreground font-bold"
                                  >
                                    Paid &amp; Done
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: MENU ITEMS */}
          <TabsContent value="menu" className="space-y-4">
            <Card className="border-border/70 bg-card">
              <CardHeader className="p-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-serif text-lg">Menu Catalog</CardTitle>
                  <CardDescription className="text-xs">
                    Add new items, update prices, or mark dishes out-of-stock.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search dishes..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="h-8 pl-8 text-xs bg-background"
                    />
                  </div>

                  <Button
                    size="sm"
                    onClick={openAddMenuModal}
                    className="h-8 bg-accent text-accent-foreground hover:bg-accent/90 text-xs gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Dish</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="w-full max-w-full overflow-x-auto bg-card">
                  <table className="w-full text-left text-xs [&>div]:max-w-full">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/40 font-serif uppercase tracking-wider text-muted-foreground">
                        <th className="py-3 px-4 whitespace-nowrap">Dish</th>
                        <th className="py-3 px-4 whitespace-nowrap">Category</th>
                        <th className="py-3 px-4 whitespace-nowrap">Price</th>
                        <th className="py-3 px-4 whitespace-nowrap">Dietary</th>
                        <th className="py-3 px-4 whitespace-nowrap">Highlight</th>
                        <th className="py-3 px-4 whitespace-nowrap">Status</th>
                        <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredMenu.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/20">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold text-foreground">{item.title}</div>
                            {item.description && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-xs">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                            {item.category}
                          </td>
                          <td className="py-3 px-4 font-serif font-bold text-foreground whitespace-nowrap">
                            {item.currency}{item.price}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 ${item.dietary === 'Non-Veg' ? 'text-destructive' : 'text-primary'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.dietary === 'Non-Veg' ? 'bg-destructive' : 'bg-primary'}`} />
                              {item.dietary || 'Veg'}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {item.is_bestseller ? (
                              <Badge className="bg-accent/20 text-accent text-[9px] px-1.5">
                                Best Seller
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleMenuAvailability(item)}
                              className={`h-6 px-2 text-[10px] rounded-full ${
                                item.is_available
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-destructive/10 text-destructive'
                              }`}
                            >
                              {item.is_available ? 'Available' : 'Out of Stock'}
                            </Button>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditMenuModal(item)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteMenuItem(item.id)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: FEEDBACK MODERATION */}
          <TabsContent value="feedback" className="space-y-4">
            <Card className="border-border/70 bg-card">
              <CardHeader className="p-4 border-b border-border/40">
                <CardTitle className="font-serif text-lg">Customer Testimonials &amp; Feedback</CardTitle>
                <CardDescription className="text-xs">
                  Moderate submitted reviews to show or hide them on the public home &amp; feedback pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full max-w-full overflow-x-auto bg-card">
                  <table className="w-full text-left text-xs [&>div]:max-w-full">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/40 font-serif uppercase tracking-wider text-muted-foreground">
                        <th className="py-3 px-4 whitespace-nowrap">Guest</th>
                        <th className="py-3 px-4 whitespace-nowrap">Email</th>
                        <th className="py-3 px-4 whitespace-nowrap">Rating</th>
                        <th className="py-3 px-4 whitespace-nowrap">Feedback Content</th>
                        <th className="py-3 px-4 whitespace-nowrap">Visibility</th>
                        <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {reviews.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No feedback submitted yet.
                          </td>
                        </tr>
                      ) : (
                        reviews.map((rev) => (
                          <tr key={rev.id} className="hover:bg-muted/20">
                            <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                              {rev.user_name}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                              {rev.user_email}
                            </td>
                            <td className="py-3 px-4 font-medium text-accent whitespace-nowrap">
                              {rev.rating || 5} / 5 ★
                            </td>
                            <td className="py-3 px-4 max-w-sm text-xs italic">
                              &ldquo;{rev.user_feedback}&rdquo;
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  rev.is_approved
                                    ? 'bg-primary/10 text-primary border-primary/30'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {rev.is_approved ? 'Publicly Visible' : 'Hidden'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleFeedback(rev)}
                                  className="h-7 px-2 text-[10px] gap-1"
                                >
                                  {rev.is_approved ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  <span>{rev.is_approved ? 'Hide' : 'Approve'}</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteFeedback(rev.id)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: RESTAURANT SETTINGS */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="border-border/70 bg-card">
              <CardHeader className="p-4 border-b border-border/40">
                <CardTitle className="font-serif text-lg">Restaurant Information &amp; Hours</CardTitle>
                <CardDescription className="text-xs">
                  Update general contact details, physical address, and origin story.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Restaurant Name</Label>
                    <Input
                      disabled
                      value="Oops! Life Cooked Again"
                      className="bg-muted text-xs font-semibold"
                    />
                    <span className="text-[10px] text-muted-foreground">Original name preserved strictly.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="s-phone" className="text-xs font-semibold">Phone Number</Label>
                      <Input
                        id="s-phone"
                        value={phoneSetting}
                        onChange={(e) => setPhoneSetting(e.target.value)}
                        className="bg-background text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="s-email" className="text-xs font-semibold">Official Email</Label>
                      <Input
                        id="s-email"
                        value={emailSetting}
                        onChange={(e) => setEmailSetting(e.target.value)}
                        className="bg-background text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="s-address" className="text-xs font-semibold">Physical Address</Label>
                    <Input
                      id="s-address"
                      value={addressSetting}
                      onChange={(e) => setAddressSetting(e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="s-about" className="text-xs font-semibold">About Us Story &amp; Philosophy</Label>
                    <Textarea
                      id="s-about"
                      rows={4}
                      value={aboutSetting}
                      onChange={(e) => setAboutSetting(e.target.value)}
                      className="bg-background text-xs leading-relaxed"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-6 font-medium gap-2"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* DISH CREATE / EDIT MODAL */}
      <Dialog open={menuModalOpen} onOpenChange={setMenuModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              {editingItem ? 'Edit Dish Details' : 'Add New Dish to Menu'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure dish information, meal category, and pricing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMenuItem} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Dish Name *</Label>
              <Input
                required
                placeholder="e.g. Masala Dosa"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                className="bg-background text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category *</Label>
                <Select value={itemCategory} onValueChange={setItemCategory}>
                  <SelectTrigger className="bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Breakfast Specials">Breakfast Specials</SelectItem>
                    <SelectItem value="Lunch Combos">Lunch Combos</SelectItem>
                    <SelectItem value="Dinner Delights">Dinner Delights</SelectItem>
                    <SelectItem value="Desserts & Beverages">Desserts &amp; Beverages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Price (₹ INR) *</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  placeholder="80"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Dietary Classification</Label>
                <Select value={itemDietary} onValueChange={setItemDietary}>
                  <SelectTrigger className="bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Veg">Pure Veg</SelectItem>
                    <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                    <SelectItem value="Beverage">Beverage</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={itemIsBestseller}
                    onChange={(e) => setItemIsBestseller(e.target.checked)}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <span>Mark as Best Seller</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                rows={2}
                placeholder="Delicious flavor profile or ingredients..."
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="bg-background text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Image URL (Optional)</Label>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={itemImageUrl}
                onChange={(e) => setItemImageUrl(e.target.value)}
                className="bg-background text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMenuModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
              >
                {editingItem ? 'Save Changes' : 'Create Dish'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};
