import React, { useState, useMemo, useCallback } from 'react';
// Fix: Corrected date-fns imports to use named imports from the main package to resolve call signature errors.
import { subDays, startOfMonth, endOfMonth } from 'date-fns';
import { MessageSquareQuote, Users, Star, Search, Map, MousePointerClick, Phone, Route, ShoppingCart } from 'lucide-react';

import { Filters, DateRange, Review as ReviewType, Sentiment } from '../types';
import { useBusinessData } from '../hooks/useBusinessData';
import { analyzeReviewSentiment } from '../services/geminiService';

import Header from './Header';
import StatCard from './StatCard';
import ReviewsPanel from './ReviewsPanel';
import ViewsChart from './ViewsChart';
import ActionsChart from './ActionsChart';
import ReviewsChart from './ReviewsChart';

const Dashboard: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [sentimentSummaries, setSentimentSummaries] = useState<{positive: string; neutral: string; negative: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    brandId: 'all',
    locationIds: [],
    dateRange: {
      from: startOfMonth(subDays(new Date(), 30)),
      to: endOfMonth(subDays(new Date(), 30)),
    },
    compareDateRange: null,
  });

  const { brands, availableLocations, kpis, compareKpis, chartData, reviews: filteredReviews, lifetimeReviews, averagePeriodRating, compareAveragePeriodRating } = useBusinessData(filters);

  React.useEffect(() => {
    setReviews(filteredReviews);
    setSentimentSummaries(null); // Reset summaries on filter change
  }, [filteredReviews]);

  const handleFiltersChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAnalyzeReviews = async () => {
    setIsAnalyzing(true);
    setSentimentSummaries(null);
    try {
      const result = await analyzeReviewSentiment(reviews);
      const updatedReviews = reviews.map(review => {
        const found = result.sentiments.find(s => s.id === review.id);
        return found ? { ...review, sentiment: found.sentiment } : review;
      });
      setReviews(updatedReviews);
      setSentimentSummaries(result.summaries);
    } catch (error) {
        if (error instanceof Error) {
            alert(error.message);
        } else {
            alert('An unknown error occurred during sentiment analysis.');
        }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalLifetimeReviews = useMemo(() => lifetimeReviews.length, [lifetimeReviews]);
  const averageLifetimeRating = useMemo(() => {
      if (lifetimeReviews.length === 0) return 0;
      const total = lifetimeReviews.reduce((acc, r) => acc + r.rating, 0);
      return (total / lifetimeReviews.length);
  }, [lifetimeReviews]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Header
        brands={brands}
        locations={availableLocations}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        chartData={chartData}
        reviewsData={reviews}
      />
      <main className="p-4 sm:p-6 lg:p-8" id="dashboard-content">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
            <StatCard icon={Search} title="Search Views" value={kpis.searches} description="Impressions from Search" compareValue={compareKpis?.searches} />
            <StatCard icon={Map} title="Map Views" value={kpis.mapViews} description="Impressions from Maps" compareValue={compareKpis?.mapViews} />
            <StatCard icon={MousePointerClick} title="Website Clicks" value={kpis.websiteClicks} description="Clicks to your website" compareValue={compareKpis?.websiteClicks} />
            <StatCard icon={Phone} title="Calls" value={kpis.calls} description="Tap-to-call actions" compareValue={compareKpis?.calls} />
            <StatCard icon={Route} title="Direction Requests" value={kpis.directionRequests} description="Users asking for directions" compareValue={compareKpis?.directionRequests} />
            <StatCard icon={ShoppingCart} title="Order Clicks" value={kpis.orderClicks} description="Clicks on order links" compareValue={compareKpis?.orderClicks} />
            <StatCard icon={MessageSquareQuote} title="Reviews (Period)" value={filteredReviews.length} description="In selected date range" />
            <StatCard icon={Star} title="Avg. Rating (Period)" value={averagePeriodRating.toFixed(1)} description="In selected date range" compareValue={compareAveragePeriodRating} />
            <StatCard icon={Users} title="Total Reviews" value={totalLifetimeReviews} description="All-time reviews" />
            <StatCard icon={Star} title="Avg. Rating (All-time)" value={averageLifetimeRating.toFixed(1)} description="All-time average" />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ViewsChart data={chartData} isComparing={!!filters.compareDateRange} />
                <ActionsChart data={chartData} isComparing={!!filters.compareDateRange} />
            </div>
            <ReviewsChart data={chartData} isComparing={!!filters.compareDateRange} />
            <ReviewsPanel 
                reviews={reviews}
                summaries={sentimentSummaries}
                onAnalyze={handleAnalyzeReviews}
                isAnalyzing={isAnalyzing}
            />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;