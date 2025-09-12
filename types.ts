export interface DailyMetric {
  date: string;
  searches: number;
  mapViews: number;
  websiteClicks: number;
  calls: number;
  directionRequests: number;
  orderClicks: number;
}

export enum Sentiment {
  Positive = 'Positive',
  Neutral = 'Neutral',
  Negative = 'Negative',
  Unanalyzed = 'Unanalyzed'
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  sentiment: Sentiment;
}

export interface Location {
  id: string;
  name: string;
  brandId: string;
  metrics: DailyMetric[];
  reviews: Review[];
}

export interface Brand {
  id: string;
  name: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Filters {
  brandId: string;
  locationIds: string[];
  dateRange: DateRange;
  compareDateRange: DateRange | null;
}

export interface SentimentAnalysisResult {
  sentiments: { id: string; sentiment: Sentiment }[];
  summaries: {
    positive: string;
    neutral: string;
    negative: string;
  };
}

export interface TrendDataPoint {
  name: string;
  value: number;
}

export interface ChartDataPoint {
  dayLabel: string;
  date: string | null;
  compareDate: string | null;
  searches: number;
  compareSearches: number;
  mapViews: number;
  compareMapViews: number;
  websiteClicks: number;
  compareWebsiteClicks: number;
  calls: number;
  compareCalls: number;
  directionRequests: number;
  compareDirectionRequests: number;
  orderClicks: number;
  compareOrderClicks: number;
  reviews: number;
  compareReviews: number;
}

export interface User {
  name: string;
  email: string;
  picture: string;
}
