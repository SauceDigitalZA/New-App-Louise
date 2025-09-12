import React, { useState, useMemo, useCallback } from 'react';
// Fix: Consolidate date-fns imports to resolve module resolution issues.
import { subDays, startOfMonth, endOfMonth } from 'date-fns';
import { MessageSquareQuote, Users, Star, Search, Map, MousePointerClick, Phone, Route, ShoppingCart, Loader2, AlertTriangle } from 'lucide-react';

import { Filters, ProcessedReview, User, ApiLocation } from '../types';
import { useBusinessData } from '../hooks/useBusinessData';
import { analyzeReviewSentiment } from '../services/geminiService';

import Header from './Header';
import StatCard from './StatCard';
import ReviewsPanel from './ReviewsPanel';
import ViewsChart from './ViewsChart';
import ActionsChart from './ActionsChart';
import ReviewsChart from './ReviewsChart';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  token: string;
  accountId: string;
  locations: ApiLocation[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, token, accountId, locations }) => {
  const [reviews, setReviews] = useState<ProcessedReview[]>([]);
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
  
  const locationIdsToFetch = useMemo(() => {
    if(filters.locationIds.length > 0) return filters.locationIds;
    if(filters.brandId !== 'all') {
      return locations.filter(l => l.title === filters.brandId).map(l => l.name);
    }
    return locations.map(l => l.name);
  }, [filters.locationIds, filters.brandId, locations]);

  const { kpis, compareKpis, chartData, reviews: filteredReviews, lifetimeReviews, averagePeriodRating, compareAveragePeriodRating, loading, error } = useBusinessData(token, accountId, locationIdsToFetch, filters);

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
      // The current `analyzeReviewSentiment` expects `Review[]`, but we have `ProcessedReview[]`
      // We need to map `ProcessedReview` to a structure it can understand
      const reviewsForAnalysis = reviews.map(r => ({ ...r, id: r.id, text: r.text }));
      const result = await analyzeReviewSentiment(reviewsForAnalysis);
      
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
        user={user}
        onLogout={onLogout}
        locations={locations}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        chartData={chartData}
        reviewsData={reviews}
      />
      <main className="p-4 sm:p-6 lg:p-8" id="dashboard-content">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
            <p className="ml-4 text-lg text-slate-600">Fetching live data...</p>
          </div>
        )}
        {error && (
            <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-10 h-10 text-red-500 mb-2"/>
                <h3 className="text-lg font-semibold text-red-800">Failed to load data</h3>
                <p className="text-red-700">{error}</p>
            </div>
        )}
        {!loading && !error && (
            <>
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
            </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;