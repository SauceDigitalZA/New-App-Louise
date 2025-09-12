import React from 'react';
import { ProcessedReview, Sentiment } from '../types';
// Fix: Consolidate date-fns imports to resolve module resolution issues.
import { format, parseISO } from 'date-fns';
import { Star, ThumbsUp, ThumbsDown, Minus, Sparkles } from 'lucide-react';
import SentimentSummary from './SentimentSummary';

interface ReviewsPanelProps {
  reviews: ProcessedReview[];
  summaries: { positive: string; neutral: string; negative: string; } | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const SentimentIcon: React.FC<{ sentiment: Sentiment }> = ({ sentiment }) => {
    switch (sentiment) {
        case Sentiment.Positive:
            return <ThumbsUp className="w-5 h-5 text-green-500" />;
        case Sentiment.Negative:
            return <ThumbsDown className="w-5 h-5 text-red-500" />;
        case Sentiment.Neutral:
            return <Minus className="w-5 h-5 text-slate-500" />;
        default:
            return null;
    }
}

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
        ))}
    </div>
);


const ReviewsPanel: React.FC<ReviewsPanelProps> = ({ reviews, summaries, onAnalyze, isAnalyzing }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <h3 className="text-xl font-bold text-slate-800">Customer Reviews</h3>
            <button
                onClick={onAnalyze}
                disabled={isAnalyzing || reviews.length === 0}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                {isAnalyzing ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        Analyze Sentiments
                    </>
                )}
            </button>
        </div>

        {summaries && <SentimentSummary summaries={summaries} />}

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b text-sm text-slate-500">
                    <tr>
                        <th className="p-2">Author</th>
                        <th className="p-2">Rating</th>
                        <th className="p-2">Review</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Sentiment</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map(review => (
                        <tr key={review.id} className="border-b hover:bg-slate-50">
                            <td className="p-2 font-medium">{review.author}</td>
                            <td className="p-2"><RatingStars rating={review.rating} /></td>
                            <td className="p-2 text-slate-600 max-w-md">{review.text}</td>
                            <td className="p-2 text-sm text-slate-500 whitespace-nowrap">{format(parseISO(review.date), 'MMM d, yyyy')}</td>
                            <td className="p-2">
                                <SentimentIcon sentiment={review.sentiment} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {reviews.length === 0 && (
                <div className="text-center p-8 text-slate-500">
                    No reviews found for the selected period.
                </div>
            )}
        </div>
    </div>
  );
};

export default ReviewsPanel;