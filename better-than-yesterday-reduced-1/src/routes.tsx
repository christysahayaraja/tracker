import type { ReactNode } from 'react';
import { BtyAuthPage } from './pages/BtyAuthPage';
import { BtyDashboardPage } from './pages/BtyDashboardPage';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { ReservationPage } from './pages/ReservationPage';
import { OrderPage } from './pages/OrderPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Better Than Yesterday',
    path: '/',
    element: <BtyAuthPage />,
    public: true,
  },
  {
    name: 'Hunter Dashboard',
    path: '/dashboard',
    element: <BtyDashboardPage />,
    public: true,
  },
  {
    name: 'Restaurant Home',
    path: '/restaurant',
    element: <HomePage />,
    public: true,
  },
  {
    name: 'Menu',
    path: '/restaurant/menu',
    element: <MenuPage />,
    public: true,
  },
  {
    name: 'Book a Table',
    path: '/restaurant/reservation',
    element: <ReservationPage />,
    public: true,
  },
  {
    name: 'Table Order',
    path: '/restaurant/order',
    element: <OrderPage />,
    public: true,
  },
  {
    name: 'Feedback',
    path: '/restaurant/feedback',
    element: <FeedbackPage />,
    public: true,
  },
  {
    name: 'Hours & Location',
    path: '/restaurant/contact',
    element: <ContactPage />,
    public: true,
  },
  {
    name: 'Admin Portal',
    path: '/restaurant/admin',
    element: <AdminPage />,
    public: true,
  }
];
