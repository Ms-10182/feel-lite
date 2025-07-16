import { google } from "googleapis";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware to analyze content for toxicity using Google's Perspective API
 * If content exceeds toxicity threshold, it will throw an error
 */
const analyzeContent = asyncHandler(async (req, _, next) => {
  const { content } = req.body;
  const API_KEY = process.env.GOOGLE_API;
  const TOXICITY_THRESHOLD = 0.8; // Configurable threshold (0 to 1)

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const DISCOVERY_URL =
    "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1";

  const client = await google.discoverAPI(DISCOVERY_URL);
  const analyzeRequest = {
    comment: {
      text: content,
    },
    requestedAttributes: {
      TOXICITY: {},
      SEVERE_TOXICITY: {},
      INSULT: {},
      PROFANITY: {},
      THREAT: {},
      IDENTITY_ATTACK: {},
    },
    languages: ['en'], // Try English first
    doNotStore: true,
  };

  try {
    const response = await new Promise((resolve, reject) => {
      client.comments.analyze(
        {
          key: API_KEY,
          resource: analyzeRequest,
        },
        (err, response) => {
          if (err) {
            // Only bypass if it's a language support error
            if (err.message.includes('language') || err.message.includes('languages')) {
              console.log("Language support error:", err.message);
              resolve({ data: { attributeScores: {} } }); // Return empty scores for unsupported language
            } else {
              console.log("API Error:", err.message);
              reject(err);
            }
          } else resolve(response);
        }
      );
    });

    // Extract scores for supported attributes
    const scores = {};
    Object.keys(analyzeRequest.requestedAttributes).forEach(attr => {
      const score = response.data?.attributeScores?.[attr]?.summaryScore?.value;
      if (score !== undefined) {
        scores[attr.toLowerCase()] = score;
      }
    });

    console.log("Content analysis scores:", scores);

    req.contentAnalysis = {
      scores,
      allScores: response.data.attributeScores,
      highestScore: Object.values(scores).length > 0 ? Math.max(...Object.values(scores)) : 0,
    };

    // Always check threshold if we have any scores
    if (Object.keys(scores).length > 0 && req.contentAnalysis.highestScore > TOXICITY_THRESHOLD) {
      const violationType = Object.entries(scores).reduce(
        (highest, [key, value]) => {
          return value > highest.value ? { type: key, value } : highest;
        },
        { type: "unknown", value: 0 }
      );

      throw new ApiError(
        400,
        `Content contains inappropriate language (${violationType.type})`
      );
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Re-throw our API errors (like toxicity threshold violations)
    }
    // For other errors (like API connection issues), log and continue
    console.log("Content analysis failed:", error.message);
    req.contentAnalysis = {
      scores: {},
      error: error.message,
      analysisSkipped: true
    };
    next();
  }
});

export { analyzeContent };
