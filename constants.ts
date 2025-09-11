import { Brand, Location, Review, Sentiment, DailyMetric } from './types';
// Fix: Use subpath imports for date-fns to resolve module errors.
import subDays from 'date-fns/subDays';
import format from 'date-fns/format';

const generateMetrics = (days: number): DailyMetric[] => {
  const metrics: DailyMetric[] = [];
  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    metrics.push({
      date,
      searches: Math.floor(Math.random() * (500 - 100 + 1) + 100),
      mapViews: Math.floor(Math.random() * (800 - 200 + 1) + 200),
      websiteClicks: Math.floor(Math.random() * (50 - 5 + 1) + 5),
      calls: Math.floor(Math.random() * (30 - 2 + 1) + 2),
      directionRequests: Math.floor(Math.random() * (40 - 10 + 1) + 10),
    });
  }
  return metrics.reverse();
};

const reviewsStore1: Review[] = [
  { id: 'r1-1', author: 'Jane D.', rating: 5, text: 'Absolutely fantastic service! The staff was friendly and the store was immaculate. Will definitely be back!', date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), sentiment: Sentiment.Unanalyzed },
  { id: 'r1-2', author: 'John S.', rating: 3, text: 'It was an average experience. Nothing special, but also nothing to complain about. The prices were reasonable.', date: format(subDays(new Date(), 12), 'yyyy-MM-dd'), sentiment: Sentiment.Unanalyzed },
  { id: 'r1-3', author: 'Emily R.', rating: 1, text: 'Terrible experience. The checkout line was incredibly long and the employees seemed completely overwhelmed and were rude.', date: format(subDays(new Date(), 25), 'yyyy-MM-dd'), sentiment: Sentiment.Unanalyzed },
  { id: 'r1-4', author: 'Chris P.', rating: 5, text: 'I love this place! A true gem in the neighborhood. Highly recommend their new coffee blend.', date: format(subDays(new Date(), 40), 'yyyy-MM-dd'), sentiment: Sentiment.Unanalyzed },
  { id: 'r1-5', author: 'Sarah L.', rating: 4, text: 'Great selection of products. I found everything I needed. A bit crowded on weekends though.', date: format(subDays(new Date(), 55), 'yyyy-MM-dd'), sentiment: Sentiment.Unanalyzed },
];

const reviewsStore2: Review[] = [
    { id: 'r2-1', author: 'Mike T.', rating: 4, text: 'Solid performance, reliable and fast. A bit pricey but you get what you pay for.', date: format(subDays(new Date(), 8), 'yyyy-MM-dd'), sentiment: Sentiment.Unanalyzed },
    { id: 'r2-2', author: 'Lisa G.', rating: 2, text: 'I was really disappointed with the customer support. I waited on hold for 45 minutes and my issue is still not resolved.', date: format(subDays(new Date(), 33), 'yyyy-MM-dd'), sentiment: Sentiment.Unanalyzed },
    { id: 'r2-3', author: 'Tom H.', rating: 5, text: 'This is the best tech store in the city! The staff are so knowledgeable and helpful. They solved my problem in minutes.', date: format(subDays(new Date(), 60), 'yyyy-MM-dd'), sentiment: Sentiment.Unanalyzed },
];

export const BRANDS: Brand[] = [
  { id: 'brand1', name: 'Urban Coffee Roasters' },
  { id: 'brand2', name: 'GadgetHub Electronics' },
];

export const LOCATIONS: Location[] = [
  {
    id: 'loc1',
    name: 'Downtown Roastery',
    brandId: 'brand1',
    metrics: generateMetrics(90),
    reviews: reviewsStore1,
  },
  {
    id: 'loc2',
    name: 'Uptown Express',
    brandId: 'brand1',
    metrics: generateMetrics(90),
    reviews: [
        { id: 'r3-1', author: 'Anna K.', rating: 5, text: 'My daily morning stop. The baristas are amazing and know my order by heart!', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), sentiment: Sentiment.Unanalyzed },
        { id: 'r3-2', author: 'Ben C.', rating: 2, text: 'The coffee was burnt and the pastry was stale. Not the quality I expect from this brand. Very disappointing.', date: format(subDays(new Date(), 45), 'yyyy-MM-dd'), sentiment: Sentiment.Unanalyzed },
    ],
  },
  {
    id: 'loc3',
    name: 'Central GadgetHub',
    brandId: 'brand2',
    metrics: generateMetrics(90),
    reviews: reviewsStore2,
  },
  {
    id: 'loc4',
    name: 'Westside Gadgets',
    brandId: 'brand2',
    metrics: generateMetrics(90),
    reviews: [
        { id: 'r4-1', author: 'David W.', rating: 5, text: 'Incredible inventory and fair prices. I found a rare adapter I couldn\'t find anywhere else.', date: format(subDays(new Date(), 15), 'yyyy-MM-dd'), sentiment: Sentiment.Unanalyzed },
        { id: 'r4-2', author: 'Jessica M.', rating: 3, text: 'The store layout is a bit confusing to navigate.', date: format(subDays(new Date(), 70), 'yyyy-MM-dd'), sentiment: Sentiment.Unanalyzed },
    ],
  },
];