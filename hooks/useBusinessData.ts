import { useState, useEffect, useMemo } from 'react';
import { Filters, ProcessedReview, ChartDataPoint, Review as ApiReview, Sentiment } from '../types';
import { getDailyMetrics, getReviews } from '../services/gmbService';
// Fix: Use deep imports for date-fns functions to resolve module resolution issues.
import isWithinInterval from 'date-fns/isWithinInterval';
import parseISO from 'date-fns/parseISO';
import differenceInDays from 'date-fns/differenceInDays';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import startOfDay from 'date-fns/startOfDay';

const ratingToNumber = (rating: ApiReview['starRating']): number => {
    switch (rating) {
        case 'ONE': return 1;
        case 'TWO': return 2;
        case 'THREE': return 3;
        case 'FOUR': return 4;
        case 'FIVE': return 5;
        default: return 0;
    }
}

const processApiReviews = (reviews: ApiReview[]): ProcessedReview[] => {
    return reviews.map(r => ({
        id: r.reviewId,
        author: r.reviewer?.displayName || 'A Customer',
        rating: ratingToNumber(r.starRating),
        text: r.comment || '',
        date: format(parseISO(r.createTime), 'yyyy-MM-dd'),
        sentiment: Sentiment.Unanalyzed,
    }));
};

interface DateMetric {
    date: string;
    searches: number;
    mapViews: number;
    websiteClicks: number;
    calls: number;
    directionRequests: number;
    orderClicks: number;
}

const calculateTotals = (metrics: DateMetric[]) => {
    return metrics.reduce(
      (acc, metric) => {
        acc.searches += metric.searches;
        acc.mapViews += metric.mapViews;
        acc.websiteClicks += metric.websiteClicks;
        acc.calls += metric.calls;
        acc.directionRequests += metric.directionRequests;
        acc.orderClicks += metric.orderClicks;
        return acc;
      },
      { searches: 0, mapViews: 0, websiteClicks: 0, calls: 0, directionRequests: 0, orderClicks: 0 }
    );
}

const groupReviewsByDate = (reviews: ProcessedReview[]) => {
    return reviews.reduce((acc, review) => {
        const date = review.date;
        if (!acc[date]) acc[date] = 0;
        acc[date]++;
        return acc;
    }, {} as {[key: string]: number});
};


export const useBusinessData = (token: string | null, accountId: string, locationIds: string[], filters: Filters) => {
    const [allMetrics, setAllMetrics] = useState<{[date: string]: DateMetric}>({});
    const [allReviews, setAllReviews] = useState<ProcessedReview[]>([]);
    const [lifetimeReviews, setLifetimeReviews] = useState<ProcessedReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            if (!token || locationIds.length === 0) {
                setAllMetrics({});
                setAllReviews([]);
                setLifetimeReviews([]);
                setLoading(false);
                return;
            };
            setLoading(true);
            setError(null);
            
            try {
                // Fetch metrics
                const from = format(filters.dateRange.from, 'yyyy-MM-dd');
                const to = format(filters.dateRange.to, 'yyyy-MM-dd');
                const metricsResponse = await getDailyMetrics(token, locationIds, from, to);

                const metricsByDate: {[date: string]: DateMetric} = {};
                metricsResponse.forEach(series => {
                    const dateStr = `${series.date.year}-${String(series.date.month).padStart(2,'0')}-${String(series.date.day).padStart(2,'0')}`;
                    if (!metricsByDate[dateStr]) {
                        metricsByDate[dateStr] = { date: dateStr, searches: 0, mapViews: 0, websiteClicks: 0, calls: 0, directionRequests: 0, orderClicks: 0 };
                    }
                    if(series.metric === 'SEARCH_IMPRESSIONS') metricsByDate[dateStr].searches += series.value;
                    if(series.metric === 'MAPS_IMPRESSIONS') metricsByDate[dateStr].mapViews += series.value;
                    if(series.metric === 'WEBSITE_CLICKS') metricsByDate[dateStr].websiteClicks += series.value;
                    if(series.metric === 'PHONE_CALLS') metricsByDate[dateStr].calls += series.value;
                    if(series.metric === 'DRIVING_DIRECTIONS') metricsByDate[dateStr].directionRequests += series.value;
                    if(series.metric === 'ORDER_CLICKS') metricsByDate[dateStr].orderClicks += series.value;
                });
                setAllMetrics(metricsByDate);

                // Fetch reviews
                const reviewPromises = locationIds.map(locId => getReviews(token, accountId, locId));
                const reviewsPerLocation = await Promise.all(reviewPromises);
                const combinedReviews = reviewsPerLocation.flat();
                const processed = processApiReviews(combinedReviews);
                setLifetimeReviews(processed);
                
                // Filter reviews for the main period
                const periodReviews = processed.filter(r => isWithinInterval(parseISO(r.date), {
                    start: startOfDay(filters.dateRange.from),
                    end: startOfDay(filters.dateRange.to),
                }));
                setAllReviews(periodReviews);

            } catch (err) {
                console.error('Error fetching business data:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, accountId, locationIds.join(','), filters.dateRange.from, filters.dateRange.to]);
  
    const processedData = useMemo(() => {
        const mainPeriodMetrics = Object.values(allMetrics);
        const totals = calculateTotals(mainPeriodMetrics);

        const averagePeriodRating = allReviews.length > 0
            ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length)
            : 0;
        
        const mainReviewsByDate = groupReviewsByDate(allReviews);
        
        // TODO: Implement comparison period fetching if required. For now, it's disabled.
        let compareTotals = null;
        let compareAveragePeriodRating = 0;
        
        const chartData: ChartDataPoint[] = [];
        const duration = differenceInDays(filters.dateRange.to, filters.dateRange.from);

        for (let i = 0; i <= duration; i++) {
            const mainDate = format(addDays(filters.dateRange.from, i), 'yyyy-MM-dd');
            const mainDayData = allMetrics[mainDate];
            const mainDayReviews = mainReviewsByDate[mainDate] || 0;

            chartData.push({
                dayLabel: format(parseISO(mainDate), 'MMM d'),
                date: mainDayData ? format(parseISO(mainDayData.date), 'MMM d') : format(parseISO(mainDate), 'MMM d'),
                compareDate: null,
                searches: mainDayData?.searches ?? 0,
                compareSearches: 0,
                mapViews: mainDayData?.mapViews ?? 0,
                compareMapViews: 0,
                websiteClicks: mainDayData?.websiteClicks ?? 0,
                compareWebsiteClicks: 0,
                calls: mainDayData?.calls ?? 0,
                compareCalls: 0,
                directionRequests: mainDayData?.directionRequests ?? 0,
                compareDirectionRequests: 0,
                orderClicks: mainDayData?.orderClicks ?? 0,
                compareOrderClicks: 0,
                reviews: mainDayReviews,
                compareReviews: 0,
            });
        }

        return {
            kpis: totals,
            compareKpis: compareTotals,
            chartData,
            reviews: allReviews,
            lifetimeReviews,
            averagePeriodRating,
            compareAveragePeriodRating,
        };
    }, [allMetrics, allReviews, lifetimeReviews, filters.dateRange, filters.compareDateRange]);

    return {
        ...processedData,
        loading,
        error,
    };
};
