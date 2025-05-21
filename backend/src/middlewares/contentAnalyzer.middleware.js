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
      SEXUALLY_EXPLICIT: {},
      PROFANITY: {},
      THREAT: {},
      IDENTITY_ATTACK: {},
    },
  };

  // Convert callback-based function to Promise and await it
  const response = await new Promise((resolve, reject) => {
    client.comments.analyze(
      {
        key: API_KEY,
        resource: analyzeRequest,
      },
      (err, response) => {
        if (err) {
          console.log(err)
          reject(err);}
        else resolve(response);
      }
    );
  }); // Extract all scores
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
});

export { analyzeContent };
