import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { restaurantService } from '@/services/restaurantService';
import { Reservation, SeatingPreference } from '@/types/restaurant';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChefLogo } from '@/components/common/ChefLogo';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Copy,
  Printer,
  RotateCcw
} from 'lucide-react';

export const ReservationPage: React.FC = () => {
  // Form state preserving exact original fields
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('19:00');
  const [guestsCount, setGuestsCount] = useState(2);
  const [seatingPreference, setSeatingPreference] = useState<SeatingPreference>('indoor');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  // Quick lookup state
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<Reservation | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleReset = () => {
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setReservationDate('');
    setReservationTime('19:00');
    setGuestsCount(2);
    setSeatingPreference('indoor');
    setAdditionalNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim() || !userEmail.trim() || !userPhone.trim() || !reservationDate || !reservationTime) {
      toast.error('Please fill in all mandatory reservation fields.');
      return;
    }

    // Check day of week for Saturday Holiday warning
    const chosenDate = new Date(reservationDate);
    if (!isNaN(chosenDate.getTime())) {
      const day = chosenDate.getUTCDay(); // 6 is Saturday
      if (day === 6) {
        toast.error('Notice: Our restaurant is closed on Saturdays (Weekly Holiday). Please choose another date.');
        return;
      }
    }

    setSubmitting(true);
    const refCode = `OLCA-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const newReservation = await restaurantService.createReservation({
        reference_code: refCode,
        guest_name: userName.trim(),
        email: userEmail.trim(),
        phone: userPhone.trim(),
        reservation_date: reservationDate,
        reservation_time: reservationTime,
        guests_count: Number(guestsCount) || 2,
        seating_preference: seatingPreference,
        additional_notes: additionalNotes.trim() || undefined,
        status: 'pending'
      });

      setConfirmedReservation(newReservation);
      toast.success('Table reservation submitted successfully!');
    } catch (err) {
      console.error('Reservation submission error:', err);
      toast.error('Failed to submit reservation. Please try again or call us.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;

    setLookupLoading(true);
    try {
      const all = await restaurantService.getReservations();
      const match = all.find(
        (r) => r.reference_code.toLowerCase() === lookupCode.trim().toLowerCase()
      );
      if (match) {
        setLookupResult(match);
        toast.success('Reservation found!');
      } else {
        toast.error('No reservation found with that reference code.');
        setLookupResult(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error looking up reservation.');
    } finally {
      setLookupLoading(false);
    }
  };

  const copyRefCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Reference code copied to clipboard!');
  };

  return (
    <MainLayout>
      {/* Header Banner */}
      <section className="bg-[#101015] text-white py-14 border-b border-[#22222B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <Badge className="bg-[#C9A96E]/20 text-[#C9A96E] border-[#C9A96E]/30 text-xs px-3 py-1">
            Table Reservations
          </Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight">
            Book a Table
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-[#C9A96E]">
            &ldquo;Good food deserves a reserved seat. Book now!&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-gray-400 font-light">
            Please fill out the form below to secure your table with your friends and family.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* CONFIRMATION SCREEN IF BOOKED */}
        {confirmedReservation ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-accent/50 bg-card shadow-2xl overflow-hidden">
              <div className="bg-accent/15 border-b border-accent/30 p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Reservation Received!
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your table request is logged. Our host will prepare your seating with care.
                </p>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Reference Code Box */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Reference Code
                    </span>
                    <p className="font-mono text-xl font-bold text-accent">
                      {confirmedReservation.reference_code}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyRefCode(confirmedReservation.reference_code)}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </Button>
                </div>

                {/* Reservation Summary Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Guest Name</span>
                    <p className="font-medium text-foreground">{confirmedReservation.guest_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Party Size</span>
                    <p className="font-medium text-foreground">{confirmedReservation.guests_count} Guests</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Date</span>
                    <p className="font-medium text-foreground">{confirmedReservation.reservation_date}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Time Slot</span>
                    <p className="font-medium text-foreground">{confirmedReservation.reservation_time}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Seating Preference</span>
                    <p className="font-medium text-foreground capitalize">
                      {confirmedReservation.seating_preference === 'indoor'
                        ? 'Indoor (Main dining room)'
                        : confirmedReservation.seating_preference === 'outdoor'
                        ? 'Outdoor (Patio)'
                        : 'No Preference'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 capitalize">
                      {confirmedReservation.status}
                    </Badge>
                  </div>
                </div>

                {confirmedReservation.additional_notes && (
                  <div className="space-y-1 text-sm border-t border-border/40 pt-3">
                    <span className="text-xs text-muted-foreground">Special Requests</span>
                    <p className="text-xs text-foreground italic">&ldquo;{confirmedReservation.additional_notes}&rdquo;</p>
                  </div>
                )}

                <div className="border-t border-border/40 pt-4 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="flex-1 gap-2 text-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Confirmation</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setConfirmedReservation(null);
                      handleReset();
                    }}
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
                  >
                    Book Another Table
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-8">
              <Card className="border-border/70 shadow-lg bg-card">
                <CardHeader className="border-b border-border/40 pb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    <CardTitle className="font-serif text-xl">Reservation Details</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Please provide your contact and booking information. All fields with * are required.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-semibold">
                          Name *
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          required
                          placeholder="Christy sahaya raja"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-semibold">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="christysahayaraja24@example.com"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    {/* Phone & Party Size Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-semibold">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          placeholder="7010847158"
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guests" className="text-xs font-semibold">
                          Number of Guests (1–20) *
                        </Label>
                        <Input
                          id="guests"
                          type="number"
                          min="1"
                          max="20"
                          required
                          value={guestsCount}
                          onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    {/* Date & Time Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-xs font-semibold">
                          Reservation Date *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={reservationDate}
                          onChange={(e) => setReservationDate(e.target.value)}
                          className="bg-background"
                        />
                        <span className="text-[10px] text-muted-foreground block">
                          Note: Saturday is a restaurant holiday.
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time" className="text-xs font-semibold">
                          Reservation Time *
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          required
                          value={reservationTime}
                          onChange={(e) => setReservationTime(e.target.value)}
                          className="bg-background"
                        />
                        <span className="text-[10px] text-muted-foreground block">
                          Operating hours: 06:00 AM – 10:00 PM
                        </span>
                      </div>
                    </div>

                    {/* Seating Preference */}
                    <div className="space-y-2">
                      <Label htmlFor="seating" className="text-xs font-semibold">
                        Seating Preference
                      </Label>
                      <Select
                        value={seatingPreference}
                        onValueChange={(val: SeatingPreference) => setSeatingPreference(val)}
                      >
                        <SelectTrigger id="seating" className="bg-background">
                          <SelectValue placeholder="Select Seating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indoor">Indoor (Main dining room)</SelectItem>
                          <SelectItem value="outdoor">Outdoor (Patio)</SelectItem>
                          <SelectItem value="no_preference">No Preference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-xs font-semibold">
                        Additional Notes
                      </Label>
                      <Textarea
                        id="notes"
                        rows={3}
                        placeholder="Any special requests or dietary restrictions?"
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        className="bg-background resize-none"
                      />
                    </div>

                    {/* Form Action Buttons (Preserving Book Now and Reset from st.boys.html) */}
                    <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="w-full sm:w-auto text-xs gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </Button>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 px-6 font-medium text-xs gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{submitting ? 'Booking Seat...' : 'Book Now'}</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Information & Lookup Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Restaurant Timing & Policy Card */}
              <Card className="border-border/60 bg-muted/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <CardTitle className="font-serif text-base">Booking Guidelines</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    • We hold reserved tables for up to <span className="font-semibold text-foreground">15 minutes</span> past your booking time.
                  </p>
                  <p>
                    • Open daily from <span className="font-semibold text-foreground">06:00 AM – 10:00 PM</span>. (Closed on Saturdays).
                  </p>
                  <p>
                    • For parties larger than 12 guests, feel free to give us a direct call at <span className="font-semibold text-accent">+91 7010847158</span>.
                  </p>
                </CardContent>
              </Card>

              {/* Check Existing Reservation */}
              <Card className="border-border/60 bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-serif text-base">Find My Reservation</CardTitle>
                  <CardDescription className="text-xs">
                    Already booked? Enter your reference code to check status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <form onSubmit={handleLookup} className="flex gap-2">
                    <Input
                      placeholder="e.g. OLCA-88219"
                      value={lookupCode}
                      onChange={(e) => setLookupCode(e.target.value)}
                      className="text-xs uppercase bg-background"
                    />
                    <Button type="submit" size="sm" disabled={lookupLoading} className="text-xs">
                      {lookupLoading ? '...' : 'Search'}
                    </Button>
                  </form>

                  {lookupResult && (
                    <div className="mt-4 p-3 rounded-lg border border-accent/40 bg-accent/5 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground">{lookupResult.guest_name}</span>
                        <Badge variant="outline" className="text-[10px] bg-accent/20 text-accent capitalize">
                          {lookupResult.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {lookupResult.reservation_date} at {lookupResult.reservation_time} ({lookupResult.guests_count} Guests)
                      </p>
                      <p className="text-muted-foreground capitalize">
                        Seating: {lookupResult.seating_preference}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
