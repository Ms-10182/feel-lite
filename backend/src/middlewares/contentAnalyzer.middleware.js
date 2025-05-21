import { google } from "googleapis";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// Simple function to detect if text might not be English
// This is a basic implementation - for production, consider using a proper language detection library
const isLikelyNonEnglish = (text) => {
  // Check for common non-Latin character patterns
  const nonLatinPattern = /[^\x00-\x7F]/g;
  
  // If more than 10% of characters are non-Latin, consider it non-English
  const nonLatinChars = text.match(nonLatinPattern) || [];
  const nonLatinRatio = nonLatinChars.length / text.length;
  
  // Check for transliteration patterns (like Hindi written in English)
  // Common patterns in transliterated Hindi/Urdu/other South Asian languages
  const transliterationPatterns = [
    /\b(hai|hain|ko|kya|maine|mujhe|tumhara|hamara|aapka|uska|yeh|woh)\b/gi,
    /\b(nahin|nahi|kyun|kyon|kaise|kaisa|accha|theek)\b/gi,
    /\b(aur|ya|lekin|par|magar|ki|ka|ke|se|main)\b/gi,
  ];
  
  // If text is relatively long and contains multiple transliteration patterns
  if (text.length > 15) {
    let matchCount = 0;
    transliterationPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matchCount += matches.length;
    });
    
    // If we have multiple matches of transliteration patterns, likely non-English
    if (matchCount >= 3) {
      return true;
    }
  }
  
  return nonLatinRatio > 0.1;
};

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
  
  // Skip analysis for likely non-English content or transliterated text
  if (isLikelyNonEnglish(content)) {
    console.log("Skipping content analysis for non-English text");
    req.contentAnalysis = {
      skipped: true,
      reason: "Likely non-English content"
    };
    return next();
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
      SEXUALLY_EXPLICIT: {},
      PROFANITY: {},
      THREAT: {},
      IDENTITY_ATTACK: {},
    },
  };
  // Convert callback-based function to Promise and await it
  try {
    const response = await new Promise((resolve, reject) => {
      client.comments.analyze(
        {
          key: API_KEY,
          resource: analyzeRequest,
        },
        (err, response) => {
          if (err) {
            console.log("Perspective API error:", err);
            // Don't reject - we'll handle this gracefully
            resolve({ error: err });
          } else {
            resolve(response);
          }
        }
      );
    });
      // If there was an error with the API call, skip analysis and proceed
    if (response.error) {
      console.log("Skipping content analysis due to API error");
      req.contentAnalysis = {
        skipped: true,
        reason: "API error or unsupported language",
        error: response.error
      };
      return next();
    }
    
    const scores = {
    toxicity: response.data.attributeScores.TOXICITY.summaryScore.value,
    severe_toxicity:
      response.data.attributeScores.SEVERE_TOXICITY.summaryScore.value,
    insult: response.data.attributeScores.INSULT.summaryScore.value,
    sexually_explicit:
      response.data.attributeScores.SEXUALLY_EXPLICIT?.summaryScore.value,
    profanity: response.data.attributeScores.PROFANITY.summaryScore.value,
    threat: response.data.attributeScores.THREAT.summaryScore.value,
    identity_attack:
      response.data.attributeScores.IDENTITY_ATTACK.summaryScore.value,
  };
  console.log(scores)

  // Store content analysis in request for potential logging/monitoring
  req.contentAnalysis = {
    scores,
    allScores: response.data.attributeScores,
    highestScore: Math.max(...Object.values(scores)),
  }; // Reject content that exceeds the threshold on any score
  if (req.contentAnalysis.highestScore > TOXICITY_THRESHOLD) {
    // Determine which type of inappropriate content was detected
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

  // Continue to the next middleware
  next();
  } catch (error) {
    console.error("Error in content analysis:", error);
    // Skip content analysis on error
    req.contentAnalysis = {
      skipped: true,
      reason: "Error during content analysis",
      error: error.message
    };
    return next();
  }
});

export { analyzeContent };
