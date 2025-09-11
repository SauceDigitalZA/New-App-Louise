import { useMemo } from 'react';
import { LOCATIONS, BRANDS } from '../constants';
import { Filters, Location, DailyMetric, Review } from '../types';
// Fix: Import date-fns functions from their specific submodules to resolve module loading issues.
import isWithinInterval from 'date-fns/isWithinInterval';
import parseISO from 'date-fns/parseISO';

const filterMetricsByDate = (metrics: DailyMetric[], dateRange: { from: Date; to: Date }) => {
  return metrics.filter(m => isWithinInterval(parseISO(m.date), dateRange));
};

const filterReviewsByDate = (reviews: Review[], dateRange: { from: Date; to: Date }) => {
    return reviews.filter(r => isWithinInterval(parseISO(r.date), dateRange));
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
    const mainPeriodLocations: Location[] = filteredLocations.map(location => ({
      ...location,
      metrics: filterMetricsByDate(location.metrics, filters.dateRange),
      reviews: filterReviewsByDate(location.reviews, filters.dateRange),
    }));

    const allMetrics = mainPeriodLocations.flatMap(l => l.metrics);
    const allReviews = mainPeriodLocations.flatMap(l => l.reviews);

    const totals = allMetrics.reduce(
      (acc, metric) => {
        acc.searches += metric.searches;
        acc.mapViews += metric.mapViews;
        acc.websiteClicks += metric.websiteClicks;
        acc.calls += metric.calls;
        acc.directionRequests += metric.directionRequests;
        return acc;
      },
      { searches: 0, mapViews: 0, websiteClicks: 0, calls: 0, directionRequests: 0 }
    );
    
    const chartData = allMetrics.reduce((acc, metric) => {
        const date = metric.date;
        if (!acc[date]) {
            acc[date] = { date, searches: 0, mapViews: 0, websiteClicks: 0, calls: 0, directionRequests: 0 };
        }
        acc[date].searches += metric.searches;
        acc[date].mapViews += metric.mapViews;
        acc[date].websiteClicks += metric.websiteClicks;
        acc[date].calls += metric.calls;
        acc[date].directionRequests += metric.directionRequests;
        return acc;
    }, {} as {[key: string]: DailyMetric});

    const lifetimeReviews = filteredLocations.flatMap(l => l.reviews);


    return {
      kpis: totals,
      chartData: Object.values(chartData).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      reviews: allReviews,
      lifetimeReviews
    };
  }, [filteredLocations, filters.dateRange]);

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