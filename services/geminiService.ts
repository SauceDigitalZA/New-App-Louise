
import { GoogleGenAI, Type } from "@google/genai";
import { Review, Sentiment, SentimentAnalysisResult } from '../types';

// Fix: Per coding guidelines, initialize GoogleGenAI with process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sentimentSchema = {
  type: Type.OBJECT,
  properties: {
    sentiments: {
      type: Type.ARRAY,
      description: "An array of sentiment analysis for each provided review.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "The unique ID of the review that was analyzed."
          },
          sentiment: {
            type: Type.STRING,
            description: "The classified sentiment. Must be one of: Positive, Neutral, Negative."
          }
        },
        required: ["id", "sentiment"],
      }
    },
    summaries: {
      type: Type.OBJECT,
      description: "Summaries for each sentiment category based on all provided reviews.",
      properties: {
        positive: {
          type: Type.STRING,
          description: "A concise summary of the key points from positive reviews."
        },
        neutral: {
          type: Type.STRING,
          description: "A concise summary of the key points from neutral reviews."
        },
        negative: {
          type: Type.STRING,
          description: "A concise summary of the key points and common complaints from negative reviews."
        }
      },
      required: ["positive", "neutral", "negative"],
    }
  },
  required: ["sentiments", "summaries"],
};

export const analyzeReviewSentiment = async (reviews: Review[]): Promise<SentimentAnalysisResult> => {
  // Fix: Removed API key check as per guidelines, which state to assume it is configured.
  if (reviews.length === 0) {
    return {
        sentiments: [],
        summaries: { positive: 'No reviews to analyze.', neutral: 'No reviews to analyze.', negative: 'No reviews to analyze.'}
    };
  }

  const model = "gemini-2.5-flash";
  const reviewsForAnalysis = reviews.map(({ id, text }) => ({ id, text }));
  
  const prompt = `
    You are an expert business review analyst.
    Your task is to perform sentiment analysis on a list of customer reviews.

    For each review, classify the sentiment as 'Positive', 'Neutral', or 'Negative'.

    After analyzing all reviews, provide three summaries:
    1. A summary of the common themes in the positive reviews.
    2. A summary of the common themes in the neutral reviews.
    3. A summary of the common themes and actionable feedback from the negative reviews.

    Here is the list of reviews to analyze:
    ${JSON.stringify(reviewsForAnalysis)}
  `;

  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: sentimentSchema,
        },
    });

    const jsonString = response.text;
    const parsedResult = JSON.parse(jsonString);

    // Validate and map the sentiment strings to our Enum
    const validatedSentiments = parsedResult.sentiments.map((s: {id: string; sentiment: string}) => {
        let sentimentEnum: Sentiment;
        switch (s.sentiment.toLowerCase()) {
            case 'positive':
                sentimentEnum = Sentiment.Positive;
                break;
            case 'neutral':
                sentimentEnum = Sentiment.Neutral;
                break;
            case 'negative':
                sentimentEnum = Sentiment.Negative;
                break;
            default:
                sentimentEnum = Sentiment.Unanalyzed;
        }
        return { id: s.id, sentiment: sentimentEnum };
    });

    return {
        sentiments: validatedSentiments,
        summaries: parsedResult.summaries,
    };

  } catch (error) {
    console.error("Error analyzing review sentiment:", error);
    throw new Error("Failed to analyze sentiments. Please check the console for details.");
  }
};