import { GmbAccount, ApiLocation, DailyMetricTimeSeries, Review } from "../types";

const API_BASE = 'https://';
const ACCOUNT_MANAGEMENT_API = 'mybusinessaccountmanagement.googleapis.com/v1';
const BUSINESS_INFORMATION_API = 'mybusinessbusinessinformation.googleapis.com/v1';
const PERFORMANCE_API = 'businessprofileperformance.googleapis.com/v1';
const REVIEWS_API = 'mybusiness.googleapis.com/v4';

const fetchWithAuth = async (url: string, token: string, options: RequestInit = {}) => {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Error:', errorData);
    throw new Error(errorData.error?.message || `Request failed with status ${response.status}`);
  }
  return response.json();
};

export const getAccounts = async (token: string): Promise<GmbAccount[]> => {
  let allAccounts: GmbAccount[] = [];
  let nextPageToken: string | undefined = undefined;
  const baseUrl = `${API_BASE}${ACCOUNT_MANAGEMENT_API}/accounts`;

  do {
    const url = nextPageToken ? `${baseUrl}?pageToken=${nextPageToken}` : baseUrl;
    const data = await fetchWithAuth(url, token);
    
    if (data.accounts) {
        allAccounts = allAccounts.concat(data.accounts);
    }
    
    nextPageToken = data.nextPageToken;

  } while (nextPageToken);

  return allAccounts;
};

export const getLocations = async (token: string, accountId: string): Promise<ApiLocation[]> => {
  const url = `${API_BASE}${BUSINESS_INFORMATION_API}/${accountId}/locations?readMask=name,title,storefrontAddress`;
  const data = await fetchWithAuth(url, token);
  return data.locations || [];
};

interface MetricResponse {
    dailyMetricTimeSeries: DailyMetricTimeSeries[];
}

interface MetricWithValue extends Omit<DailyMetricTimeSeries['timeSeries'][0], 'value'> {
    metric: DailyMetricTimeSeries['dailyMetric'];
    value: number;
}

export const getDailyMetrics = async (token: string, locationNames: string[], fromDate: string, toDate: string): Promise<MetricWithValue[]> => {
  const url = `${API_BASE}${PERFORMANCE_API}/locations:reportDailyMetricsTimeSeries`;
  
  const [fromYear, fromMonth, fromDay] = fromDate.split('-').map(Number);
  const [toYear, toMonth, toDay] = toDate.split('-').map(Number);

  const body = {
    locations: locationNames,
    dailyMetrics: [
      "SEARCH_IMPRESSIONS",
      "MAPS_IMPRESSIONS",
      "WEBSITE_CLICKS",
      "PHONE_CALLS",
      "DRIVING_DIRECTIONS",
      "ORDER_CLICKS",
    ],
    dailyRange: {
      startDate: { year: fromYear, month: fromMonth, day: fromDay },
      endDate: { year: toYear, month: toMonth, day: toDay },
    },
  };

  const response = await fetchWithAuth(url, token, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const allMetrics: MetricWithValue[] = [];
  if (response.multiDailyMetricTimeSeries) {
      response.multiDailyMetricTimeSeries.forEach((locationMetrics: any) => {
          if (locationMetrics.dailyMetricTimeSeries) {
              locationMetrics.dailyMetricTimeSeries.forEach((ts: DailyMetricTimeSeries) => {
                  if (ts.timeSeries) {
                      ts.timeSeries.forEach((dp: any) => {
                          allMetrics.push({
                              metric: ts.dailyMetric,
                              date: dp.date,
                              value: parseInt(dp.value, 10) || 0,
                          });
                      });
                  }
              });
          }
      });
  }

  return allMetrics;
};


export const getReviews = async (token: string, accountId: string, locationId: string): Promise<Review[]> => {
  const locId = locationId.split('/')[1];
  const accId = accountId.split('/')[1];
  const url = `${API_BASE}${REVIEWS_API}/accounts/${accId}/locations/${locId}/reviews`;
  const data = await fetchWithAuth(url, token);
  return data.reviews || [];
};