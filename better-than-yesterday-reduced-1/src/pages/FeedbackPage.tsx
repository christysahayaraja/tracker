import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { restaurantService } from '@/services/restaurantService';
import { FeedbackReview } from '@/types/restaurant';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  MessageSquareQuote, 
  Star, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  Smile, 
  Heart,
  Quote
} from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  // Preserving original fields: Name, Email, Feedback
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userFeedback, setUserFeedback] = useState('');
  const [rating, setRating] = useState(5);

  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Reviews list
  const [reviews, setReviews] = useState<FeedbackReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const data = await restaurantService.getFeedback(true);
      setReviews(data);
    } catch (err) {
      console.error('Error fetching feedback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReset = () => {
    setUserName('');
    setUserEmail('');
    setUserFeedback('');
    setRating(5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim() || !userEmail.trim() || !userFeedback.trim()) {
      toast.error('Please complete all feedback fields.');
      return;
    }

    setSubmitting(true);
    try {
      await restaurantService.submitFeedback({
        user_name: userName.trim(),
        user_email: userEmail.trim(),
        user_feedback: userFeedback.trim(),
        rating,
        is_approved: true
      });

      setSubmittedSuccess(true);
      toast.success('Thank you! Your feedback has been recorded.');
      fetchReviews();
    } catch (err) {
      console.error('Feedback submit error', err);
      toast.error('Could not submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      {/* Banner */}
      <section className="bg-[#101015] text-white py-14 border-b border-[#22222B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <Badge className="bg-[#C9A96E]/20 text-[#C9A96E] border-[#C9A96E]/30 text-xs px-3 py-1">
            Community Voices
          </Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight">
            Feedback &amp; Reviews
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-[#C9A96E]">
            &ldquo;Life cooked you again? Tell us if we cooked it better!&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-gray-400 font-light">
            Please share your thoughts below. Your honest feedback helps us heal more cravings every day.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Feedback Form Column */}
          <div className="lg:col-span-6">
            <Card className="border-border/70 shadow-lg bg-card">
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote className="w-5 h-5 text-accent" />
                  <CardTitle className="font-serif text-xl">Feedback Form</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  We appreciate your candid comments, suggestions, or compliments.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                {submittedSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif text-lg font-bold text-foreground">
                        Thank You, {userName}!
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Your words inspire our team to cook with even more passion and heart.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSubmittedSuccess(false);
                        handleReset();
                      }}
                      className="text-xs mt-2"
                    >
                      Submit Another Review
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Rating selector */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Your Dining Experience</Label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                            aria-label={`Rate ${star} stars`}
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= rating
                                  ? 'text-accent fill-current'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-medium text-accent ml-2">
                          {rating === 5 ? 'Exceptional (5/5)' : `${rating}/5 Stars`}
                        </span>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-1.5">
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

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="christysahayaraja24@example"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    {/* Feedback textarea */}
                    <div className="space-y-1.5">
                      <Label htmlFor="feedback" className="text-xs font-semibold">
                        Your Feedback *
                      </Label>
                      <Textarea
                        id="feedback"
                        rows={4}
                        required
                        placeholder="Share your experience, suggestions, or any comments here..."
                        value={userFeedback}
                        onChange={(e) => setUserFeedback(e.target.value)}
                        className="bg-background resize-none text-xs leading-relaxed"
                      />
                    </div>

                    {/* Buttons matching st.boys.html */}
                    <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="text-xs gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </Button>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-5 gap-2 font-medium"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Testimonials List Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <h3 className="font-serif text-xl font-bold text-foreground">
                What Diners Are Saying
              </h3>
              <Badge variant="outline" className="text-xs bg-muted">
                {reviews.length} Verified Reviews
              </Badge>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-32 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {reviews.map((rev) => (
                  <Card key={rev.id} className="p-5 rounded-xl border border-border/60 bg-card hover:border-accent/40 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-accent">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent Diner'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed">
                      &ldquo;{rev.user_feedback}&rdquo;
                    </p>

                    <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between">
                      <span className="font-serif font-semibold text-xs text-foreground">
                        {rev.user_name}
                      </span>
                      <span className="text-[10px] text-accent flex items-center gap-1">
                        <Smile className="w-3 h-3" />
                        <span>Verified Guest</span>
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
