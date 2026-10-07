import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { restaurantService } from '@/services/restaurantService';
import { RestaurantSettings, DayTiming } from '@/types/restaurant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Navigation, 
  Send, 
  CheckCircle2, 
  Share2, 
  ExternalLink,
  Compass,
  Bus,
  Train,
  Building2,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

export const ContactPage: React.FC = () => {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Inquiry form states
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await restaurantService.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Error loading settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    setSubmitting(true);
    try {
      await restaurantService.submitFeedback({
        user_name: inquiryName.trim(),
        user_email: inquiryEmail.trim(),
        user_feedback: `[Contact Form Inquiry: ${inquirySubject || 'General'}] ${inquiryMessage.trim()}`,
        rating: 5,
        is_approved: false
      });

      toast.success('Thank you! Your message has been sent to our team.');
      setInquiryName('');
      setInquiryEmail('');
      setInquirySubject('');
      setInquiryMessage('');
    } catch (err) {
      console.error('Inquiry error:', err);
      toast.error('Could not submit inquiry right now. Please call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: "Oops! Life Cooked Again - Restaurant",
        text: "Visit Oops! Life Cooked Again at St. Joseph's College Autonomous, Trichy-620002",
        url: "https://maps.google.com/?q=St.Joseph's+College+Trichy"
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText("Oops! Life Cooked Again, 2nd B.Sc CS, St. Joseph's College (Autonomous), Trichy-620002");
      toast.success('Restaurant address copied to clipboard!');
    }
  };

  const googleMapsSearchUrl = "https://www.google.com/maps/search/?api=1&query=St.+Joseph%27s+College+Autonomous+Trichy+Tamil+Nadu+620002";
  const googleMapsDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=St.+Joseph%27s+College+Autonomous+Trichy+Tamil+Nadu+620002";

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 md:py-14 max-w-6xl space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline" className="border-accent/40 text-accent text-xs font-semibold px-3 py-1 mb-1">
            Find Us in Tiruchirappalli
          </Badge>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Hours &amp; Location
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Visit our eatery inside the iconic St. Joseph&apos;s College campus or reach out to our team.
          </p>
        </div>

        {/* 3 Core Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/70 p-6 bg-card space-y-3 relative overflow-hidden group hover:border-accent/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-foreground">Campus Address</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              2nd Bsc CS, St.Joseph&apos;s College(Autonomous)<br />
              College Road, Teppakulam, Trichy - 620002
            </p>
            <div className="pt-1 flex items-center gap-3">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-semibold"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </a>
              <button
                type="button"
                onClick={handleShareLocation}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </button>
            </div>
          </Card>

          <Card className="border-border/70 p-6 bg-card space-y-3 relative overflow-hidden group hover:border-accent/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-foreground">Phone &amp; Direct Call</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For table bookings, catering, or bulk student & faculty orders:
            </p>
            <p className="font-serif font-bold text-sm text-foreground">
              +91 7010847158
            </p>
            <a
              href="tel:+917010847158"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-semibold pt-1"
            >
              <span>Call Now</span>
            </a>
          </Card>

          <Card className="border-border/70 p-6 bg-card space-y-3 relative overflow-hidden group hover:border-accent/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-foreground">Official Email</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Inquiries, feedback &amp; party orders:
            </p>
            <div className="text-xs font-medium text-foreground space-y-0.5">
              <p>oopslifecookedagain@gmail.com</p>
              <p className="text-muted-foreground">lifecookedagain@gmail.com</p>
            </div>
            <a
              href="mailto:oopslifecookedagain@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-semibold pt-1"
            >
              <span>Send Email</span>
            </a>
          </Card>
        </div>

        {/* Operating Hours Table and Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Weekly Hours */}
          <div className="lg:col-span-7">
            <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <CardTitle className="font-serif text-xl">Weekly Operating Hours</CardTitle>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-xs">
                    Sunday–Friday Open
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Exact schedule maintained at St. Joseph&apos;s College Trichy campus.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <div className="w-full max-w-full overflow-x-auto bg-card">
                  <table className="w-full text-left text-sm [&>div]:max-w-full">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/40 text-xs font-serif uppercase tracking-wider text-muted-foreground">
                        <th className="py-3 px-6 whitespace-nowrap">Day</th>
                        <th className="py-3 px-6 whitespace-nowrap">Timing</th>
                        <th className="py-3 px-6 whitespace-nowrap text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {settings?.opening_hours?.map((schedule, idx) => (
                        <tr
                          key={idx}
                          className={`transition-colors hover:bg-muted/30 ${
                            schedule.day === 'Saturday' ? 'bg-destructive/5' : ''
                          }`}
                        >
                          <td className="py-3.5 px-6 font-medium whitespace-nowrap text-foreground flex items-center gap-2">
                            <span>{schedule.day}</span>
                            {schedule.day === 'Saturday' && (
                              <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive py-0 px-1.5">
                                Weekly Off
                              </Badge>
                            )}
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap font-mono text-xs text-muted-foreground">
                            {schedule.timing}
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap text-right">
                            {schedule.isOpen ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Open
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-destructive font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                                Closed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-muted/20 border-t border-border/40 text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    <span>Serving Breakfast (6am - 11am), Lunch (12pm - 3:30pm), Snacks &amp; Dinner (5pm - 10pm).</span>
                  </p>
                  <p className="text-muted-foreground/80 pl-5">
                    * Saturday is reserved for deep kitchen sanitation, herb restocking, and kitchen maintenance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Inquiry Form */}
          <div className="lg:col-span-5">
            <Card className="border-border/70 shadow-sm bg-card">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="font-serif text-lg text-foreground">
                  Send Us a Direct Message
                </CardTitle>
                <CardDescription className="text-xs">
                  Questions about our menu, special catering, or table queries? Write to us below.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="inq-name" className="text-xs font-semibold">Your Name *</Label>
                    <Input
                      id="inq-name"
                      required
                      placeholder="e.g. Christy / Vignesh"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inq-email" className="text-xs font-semibold">Your Email *</Label>
                    <Input
                      id="inq-email"
                      type="email"
                      required
                      placeholder="christy@example.com"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inq-sub" className="text-xs font-semibold">Subject</Label>
                    <Input
                      id="inq-sub"
                      placeholder="e.g. Table order inquiry / Special event"
                      value={inquirySubject}
                      onChange={(e) => setInquirySubject(e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inq-msg" className="text-xs font-semibold">Message *</Label>
                    <Textarea
                      id="inq-msg"
                      rows={3}
                      required
                      placeholder="Tell us what you'd like to ask..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="bg-background resize-none text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs gap-2 font-medium"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ENHANCED GOOGLE MAPS SECTION WITH NAVIGATION & LANDMARKS */}
        <div className="rounded-2xl overflow-hidden border border-border/80 shadow-lg bg-card">
          
          {/* Header Bar */}
          <div className="p-4 sm:p-5 bg-muted/40 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="font-serif font-bold text-lg text-foreground">
                  Interactive Google Map &amp; Navigation
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                St. Joseph&apos;s College (Autonomous), College Road, Tiruchirappalli, Tamil Nadu 620002
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold gap-1.5 shadow-sm">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Turn-by-Turn Directions</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </Button>
              </a>
              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="text-xs gap-1 border-border">
                  <span>Open in Google Maps</span>
                </Button>
              </a>
            </div>
          </div>

          {/* Map Frame Container */}
          <div className="w-full aspect-[16/9] md:aspect-[21/9] min-h-[320px] bg-muted/20 relative">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed/v1/place?key=AIzaSyB_LJOYJL-84SMuxNB7LtRGhxEQLjswvy0&q=St.+Joseph's+College+Autonomous+Trichy+Tamil+Nadu&language=en&region=cn"
              allowFullScreen
              title="Oops! Life Cooked Again Google Map Location"
              className="w-full h-full"
            />
          </div>

          {/* Landmarks and Directions Guide */}
          <div className="p-4 sm:p-6 bg-card border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/50">
              <Building2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block mb-0.5">Campus Landmark</span>
                <span className="text-muted-foreground">
                  Located near the 2nd B.Sc Computer Science wing, within easy access from the Main Gate quadrangle.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/50">
              <Bus className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block mb-0.5">By Bus / Public Transit</span>
                <span className="text-muted-foreground">
                  Only 5 mins walk (400m) from Chathiram Bus Stand, Tiruchirappalli. Frequent city buses available.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/50">
              <Train className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block mb-0.5">Railway &amp; Fort</span>
                <span className="text-muted-foreground">
                  1 km from iconic Rockfort Ucchi Pillayar Temple • 4.5 km from Tiruchirappalli Junction Railway Station.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};
