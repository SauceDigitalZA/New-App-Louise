import React, { useState, useMemo, useCallback } from 'react';
// Fix: Use subpath imports for date-fns to resolve module errors.
import subDays from 'date-fns/subDays';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import { BarChart2, MessageSquareQuote, Users, LineChart, Star } from 'lucide-react';

import { Filters, DateRange, Review as ReviewType, Sentiment } from '../types';
import { useBusinessData } from '../hooks/useBusinessData';
import { analyzeReviewSentiment } from '../services/geminiService';

import Header from './Header';
import StatCard from './StatCard';
import PerformanceChart from './PerformanceChart';
import ReviewsPanel from './ReviewsPanel';

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

  const { brands, availableLocations, kpis, chartData, reviews: filteredReviews, lifetimeReviews } = useBusinessData(filters);

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
      return (total / lifetimeReviews.length).toFixed(1);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <StatCard icon={BarChart2} title="Total Views" value={kpis.searches + kpis.mapViews} description="Search + Map Views" />
          <StatCard icon={LineChart} title="Customer Actions" value={kpis.websiteClicks + kpis.calls + kpis.directionRequests} description="Clicks, Calls, Directions" />
          <StatCard icon={MessageSquareQuote} title="Reviews (Period)" value={reviews.length} description="In selected date range" />
          <StatCard icon={Users} title="Total Reviews" value={totalLifetimeReviews} description="All-time reviews" />
          <StatCard icon={Star} title="Avg. Rating" value={averageLifetimeRating} description="All-time average" />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
            <PerformanceChart data={chartData} />
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