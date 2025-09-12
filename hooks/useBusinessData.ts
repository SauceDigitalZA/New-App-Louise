import { useMemo } from 'react';
import { LOCATIONS, BRANDS } from '../constants';
import { Filters, Location, DailyMetric, Review, ChartDataPoint } from '../types';
// Fix: Corrected date-fns imports to use named imports from the main package to resolve call signature errors.
import { isWithinInterval, parseISO, differenceInDays, addDays, format } from 'date-fns';

const filterMetricsByDate = (metrics: DailyMetric[], dateRange: { from: Date; to: Date }) => {
  return metrics.filter(m => isWithinInterval(parseISO(m.date), dateRange));
};

const filterReviewsByDate = (reviews: Review[], dateRange: { from: Date; to: Date }) => {
    return reviews.filter(r => isWithinInterval(parseISO(r.date), dateRange));
};

const calculateTotals = (metrics: DailyMetric[]) => {
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

const groupMetricsByDate = (metrics: DailyMetric[]) => {
    return metrics.reduce((acc, metric) => {
        const date = metric.date;
        if (!acc[date]) {
            acc[date] = { date, searches: 0, mapViews: 0, websiteClicks: 0, calls: 0, directionRequests: 0, orderClicks: 0 };
        }
        acc[date].searches += metric.searches;
        acc[date].mapViews += metric.mapViews;
        acc[date].websiteClicks += metric.websiteClicks;
        acc[date].calls += metric.calls;
        acc[date].directionRequests += metric.directionRequests;
        acc[date].orderClicks += metric.orderClicks;
        return acc;
    }, {} as {[key: string]: DailyMetric});
}

const groupReviewsByDate = (reviews: Review[]) => {
    return reviews.reduce((acc, review) => {
        const date = review.date;
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date]++;
        return acc;
    }, {} as {[key: string]: number});
};


export const useBusinessData = (filters: Filters) => {
  const filteredLocations = useMemo(() => {
    let locations = LOCATIONS;

    if (filters.brandId !== 'all') {
      locations = locations.filter(l => l.brandId === filters.brandId);
    }

    if (filters.locationIds.length > 0) {
      locations = locations.filter(l => filters.locationIds.includes(l.id));
    }
    
    return locations;
  }, [filters.brandId, filters.locationIds]);
  
  const processedData = useMemo(() => {
    // Main period data
    const mainPeriodLocations = filteredLocations.map(location => ({
      ...location,
      metrics: filterMetricsByDate(location.metrics, filters.dateRange),
      reviews: filterReviewsByDate(location.reviews, filters.dateRange),
    }));
    const allMetrics = mainPeriodLocations.flatMap(l => l.metrics);
    const allReviews = mainPeriodLocations.flatMap(l => l.reviews);
    const totals = calculateTotals(allMetrics);
    const averagePeriodRating = allReviews.length > 0
        ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length)
        : 0;
    
    const mainMetricsByDate = groupMetricsByDate(allMetrics);
    const mainReviewsByDate = groupReviewsByDate(allReviews);


    // Comparison period data
    let compareTotals = null;
    let compareAveragePeriodRating = 0;
    let compareMetricsByDate: {[key: string]: DailyMetric} = {};
    let compareReviewsByDate: {[key: string]: number} = {};

    if (filters.compareDateRange) {
        const comparePeriodLocations = filteredLocations.map(location => ({
            ...location,
            metrics: filterMetricsByDate(location.metrics, filters.compareDateRange),
            reviews: filterReviewsByDate(location.reviews, filters.compareDateRange),
        }));
        const allCompareMetrics = comparePeriodLocations.flatMap(l => l.metrics);
        const allCompareReviews = comparePeriodLocations.flatMap(l => l.reviews);
        compareTotals = calculateTotals(allCompareMetrics);
        compareAveragePeriodRating = allCompareReviews.length > 0
            ? (allCompareReviews.reduce((acc, r) => acc + r.rating, 0) / allCompareReviews.length)
            : 0;
        compareMetricsByDate = groupMetricsByDate(allCompareMetrics);
        compareReviewsByDate = groupReviewsByDate(allCompareReviews);
    }
    
    // Chart data generation
    const chartData: ChartDataPoint[] = [];
    const duration = differenceInDays(filters.dateRange.to, filters.dateRange.from);

    for (let i = 0; i <= duration; i++) {
        const mainDate = format(addDays(filters.dateRange.from, i), 'yyyy-MM-dd');
        const mainDayData = mainMetricsByDate[mainDate];
        const mainDayReviews = mainReviewsByDate[mainDate] || 0;

        let compareDayData: DailyMetric | undefined;
        let compareDayReviews = 0;
        let compareDate: string | null = null;
        
        if (filters.compareDateRange) {
            const compareDateRaw = addDays(filters.compareDateRange.from, i);
            compareDate = format(compareDateRaw, 'yyyy-MM-dd');
            compareDayData = compareMetricsByDate[compareDate];
            compareDayReviews = compareReviewsByDate[compareDate] || 0;
        }

        chartData.push({
            dayLabel: format(parseISO(mainDate), 'MMM d'),
            date: mainDayData ? format(parseISO(mainDayData.date), 'MMM d') : format(parseISO(mainDate), 'MMM d'),
            compareDate: compareDate ? format(parseISO(compareDate), 'MMM d') : null,
            searches: mainDayData?.searches ?? 0,
            compareSearches: compareDayData?.searches ?? 0,
            mapViews: mainDayData?.mapViews ?? 0,
            compareMapViews: compareDayData?.mapViews ?? 0,
            websiteClicks: mainDayData?.websiteClicks ?? 0,
            compareWebsiteClicks: compareDayData?.websiteClicks ?? 0,
            calls: mainDayData?.calls ?? 0,
            compareCalls: compareDayData?.calls ?? 0,
            directionRequests: mainDayData?.directionRequests ?? 0,
            compareDirectionRequests: compareDayData?.directionRequests ?? 0,
            orderClicks: mainDayData?.orderClicks ?? 0,
            compareOrderClicks: compareDayData?.orderClicks ?? 0,
            reviews: mainDayReviews,
            compareReviews: compareDayReviews,
        });
    }

    const lifetimeReviews = filteredLocations.flatMap(l => l.reviews);

    return {
      kpis: totals,
      compareKpis: compareTotals,
      chartData,
      reviews: allReviews,
      lifetimeReviews,
      averagePeriodRating,
      compareAveragePeriodRating,
    };
  }, [filteredLocations, filters.dateRange, filters.compareDateRange]);

  const availableLocations = useMemo(() => {
    if(filters.brandId === 'all') return LOCATIONS;
    return LOCATIONS.filter(l => l.brandId === filters.brandId)
  }, [filters.brandId]);


  return {
    brands: BRANDS,
    availableLocations,
    ...processedData,
  };
};