import React from 'react';
import { Link } from 'react-router-dom';
import { ChefLogo } from '@/components/common/ChefLogo';
import { MapPin, Phone, Mail, Instagram, Clock, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0E0E12] text-[#E0DFD5] border-t border-[#23232C] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-[#23232C]">
          {/* Column 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-4">
            <ChefLogo size="lg" variant="gold" />
            
            <p className="font-serif italic text-base text-[#D4AF37] leading-relaxed max-w-lg mt-3">
              &ldquo;Life may cook you every day, but we&apos;ll always cook something that makes you smile.&rdquo;
            </p>
            
            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              A friends-owned restaurant where great food meets great friendships. Serving heartfelt recipes, sharing good vibes, and healing your cravings one plate at a time.
            </p>
            
            <div className="pt-2">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#C9A96E] bg-[#1A1A22] px-3 py-1.5 rounded-full border border-[#C9A96E]/30">
                Cooked food better than your life
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-white font-semibold tracking-wide border-b border-[#C9A96E]/30 pb-2">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-[#C9A96E] transition-colors">Home & Story</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-[#C9A96E] transition-colors">Our Full Menu</Link>
              </li>
              <li>
                <Link to="/reservation" className="hover:text-[#C9A96E] transition-colors">Book a Table</Link>
              </li>
              <li>
                <Link to="/order" className="hover:text-[#C9A96E] transition-colors">Order Online</Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-[#C9A96E] transition-colors">Guest Feedback</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C9A96E] transition-colors">Operating Hours</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#C9A96E] transition-colors">Staff Portal</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Location */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-white font-semibold tracking-wide border-b border-[#C9A96E]/30 pb-2">
              Visit & Contact
            </h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C9A96E] shrink-0 mt-0.5" />
                <span>2nd Bsc CS, St.Joseph&apos;s College(Autonomous) Trichy-620002</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#C9A96E] shrink-0" />
                <a href="tel:+917010847158" className="hover:text-[#C9A96E] transition-colors">
                  +91 7010847158
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#C9A96E] shrink-0" />
                <a href="mailto:oopslifecookedagain@gmail.com" className="hover:text-[#C9A96E] transition-colors text-xs break-all">
                  oopslifecookedagain@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#C9A96E] shrink-0" />
                <span>Sun–Fri: 06:00 AM – 10:00 PM (Sat: Holiday)</span>
              </div>
              <div className="pt-2">
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-[#C9A96E] hover:underline"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Follow us on Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p className="flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()} Oops! Life Cooked Again. All rights reserved.</span>
          </p>
          <p className="text-gray-400 font-medium">
            Thank you for dining with us!
          </p>
        </div>
      </div>
    </footer>
  );
};
