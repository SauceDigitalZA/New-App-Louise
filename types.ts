// API Response Types
export interface GmbAccount {
  name: string; // e.g., "accounts/12345"
  displayName: string;
  accountType: 'PERSONAL' | 'LOCATION_GROUP' | 'ORGANIZATION';
}

export interface ApiLocation {
  name: string; // e.g., "locations/98765"
  title: string;
  languageCode: string;
  storefrontAddress: {
    addressLines: string[];
    locality: string;
    administrativeArea: string;
    postalCode: string;
    regionCode: string;
  };
}

export interface DailyMetricTimeSeries {
    dailyMetric: 'SEARCH_IMPRESSIONS' | 'MAPS_IMPRESSIONS' | 'WEBSITE_CLICKS' | 'PHONE_CALLS' | 'DRIVING_DIRECTIONS' | 'ORDER_CLICKS';
    timeSeries: {
        date: { year: number; month: number; day: number; };
        value: string;
    }[];
}

// Internal Application Types
export interface Review {
  name: string; // From API, e.g. "accounts/{accountId}/locations/{locationId}/reviews/{reviewId}"
  reviewId: string;
  reviewer: {
    displayName: string;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment: string;
  createTime: string; // ISO 8601 string
  sentiment?: Sentiment; // Appended by Gemini
}

export enum Sentiment {
  Positive = 'Positive',
  Neutral = 'Neutral',
  Negative = 'Negative',
  Unanalyzed = 'Unanalyzed'
}

export interface ProcessedReview {
  id: string; // reviewId
  author: string;
  rating: number;
  text: string;
  date: string; // 'yyyy-MM-dd' format
  sentiment: Sentiment;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Filters {
  brandId: string; // Corresponds to location name/title for grouping
  locationIds: string[]; // Location names, e.g. "locations/98765"
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