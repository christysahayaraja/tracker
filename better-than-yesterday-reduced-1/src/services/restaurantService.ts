import { supabase } from '@/db/supabase';
import { 
  MenuItem, 
  Reservation, 
  FeedbackReview, 
  OnlineOrder, 
  RestaurantSettings 
} from '@/types/restaurant';

export const restaurantService = {
  // Menu items
  async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
    return data || [];
  },

  async createMenuItem(item: Omit<MenuItem, 'id' | 'created_at'>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteMenuItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Reservations
  async getReservations(): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
    return data || [];
  },

  async createReservation(reservation: Omit<Reservation, 'id' | 'created_at'>): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .insert([reservation])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateReservationStatus(id: string, status: Reservation['status'], admin_notes?: string): Promise<Reservation> {
    const updates: Partial<Reservation> = { status };
    if (admin_notes !== undefined) {
      updates.admin_notes = admin_notes;
    }
    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Feedback & Reviews
  async getFeedback(onlyApproved = false): Promise<FeedbackReview[]> {
    let query = supabase
      .from('feedback_reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (onlyApproved) {
      query = query.eq('is_approved', true);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
    return data || [];
  },

  async submitFeedback(feedback: Omit<FeedbackReview, 'id' | 'created_at'>): Promise<FeedbackReview> {
    const { data, error } = await supabase
      .from('feedback_reviews')
      .insert([feedback])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleFeedbackApproval(id: string, is_approved: boolean): Promise<FeedbackReview> {
    const { data, error } = await supabase
      .from('feedback_reviews')
      .update({ is_approved })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteFeedback(id: string): Promise<void> {
    const { error } = await supabase
      .from('feedback_reviews')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Online Orders
  async createOrder(order: Omit<OnlineOrder, 'id' | 'created_at'>): Promise<OnlineOrder> {
    const { data, error } = await supabase
      .from('online_orders')
      .insert([order])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getOrders(): Promise<OnlineOrder[]> {
    const { data, error } = await supabase
      .from('online_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateOrderStatus(id: string, status: OnlineOrder['status']): Promise<OnlineOrder> {
    const { data, error } = await supabase
      .from('online_orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Settings
  async getSettings(): Promise<RestaurantSettings> {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .eq('id', 'main')
      .single();
    if (error) {
      console.error('Error fetching settings:', error);
      return {
        id: 'main',
        restaurant_name: 'Oops! Life Cooked Again',
        tagline: 'Life cooked you. So we cooked for you.',
        subtagline: 'Life cooked you. Our menu heals you.',
        phone: '+91 7010847158',
        email: 'oopslifecookedagain@gmail.com',
        address: "2nd Bsc CS, St.Joseph's College(Autonomous) Trichy-620002",
        opening_hours: [
          { day: 'Monday', timing: '06:00 AM - 10:00 PM', isOpen: true },
          { day: 'Tuesday', timing: '06:00 AM - 10:00 PM', isOpen: true },
          { day: 'Wednesday', timing: '06:00 AM - 10:00 PM', isOpen: true },
          { day: 'Thursday', timing: '06:00 AM - 10:00 PM', isOpen: true },
          { day: 'Friday', timing: '06:00 AM - 10:00 PM', isOpen: true },
          { day: 'Saturday', timing: 'Holiday', isOpen: false },
          { day: 'Sunday', timing: '06:00 AM - 10:00 PM', isOpen: true }
        ],
        about_text: '"Oops! Life Cooked Again" is a friends-owned restaurant where great food meets great friendships. We\'re just a bunch of friends who love food and decided to turn our endless cravings into a restaurant. A few days ago, Oops! Life Cooked Again was born with one goal—to serve tasty food, share good vibes, and create happy memories. We cook food better than your life.'
      };
    }
    return data;
  },

  async updateSettings(settings: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', 'main')
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
