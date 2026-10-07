export interface MenuItem {
  id: string;
  title: string;
  category: 'Breakfast Specials' | 'Lunch Combos' | 'Dinner Delights' | 'Desserts & Beverages' | string;
  price: number;
  currency: string;
  description?: string;
  image_url?: string;
  is_bestseller: boolean;
  is_available: boolean;
  dietary?: 'Veg' | 'Non-Veg' | 'Beverage' | 'Dessert' | string;
  display_order?: number;
  created_at?: string;
}

export type SeatingPreference = 'indoor' | 'outdoor' | 'no_preference';
export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Reservation {
  id?: string;
  reference_code: string;
  guest_name: string;
  email: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  guests_count: number;
  seating_preference: SeatingPreference;
  additional_notes?: string;
  status: ReservationStatus;
  admin_notes?: string;
  created_at?: string;
}

export interface FeedbackReview {
  id?: string;
  user_name: string;
  user_email: string;
  user_feedback: string;
  rating: number;
  is_approved?: boolean;
  created_at?: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  dietary?: string;
  image_url?: string;
  quantity: number;
}

export type OrderStatus = 'received' | 'preparing' | 'served' | 'completed' | 'cancelled';
export type OrderType = 'table_order' | 'pickup' | 'dine_in';

export interface OnlineOrder {
  id?: string;
  order_code: string;
  table_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  order_type: OrderType;
  items: CartItem[];
  subtotal: number;
  status: OrderStatus;
  special_instructions?: string;
  created_at?: string;
}

export interface DayTiming {
  day: string;
  timing: string;
  isOpen: boolean;
}

export interface RestaurantSettings {
  id: string;
  restaurant_name: string;
  tagline: string;
  subtagline?: string;
  phone: string;
  email: string;
  address: string;
  opening_hours: DayTiming[];
  about_text: string;
  updated_at?: string;
}
