import { google } from "googleapis";
import ContentSafetyClient, {
  isUnexpected,
} from "@azure-rest/ai-content-safety";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { FileTypeCheck } from "../utils/imageExtensionValidator.js";

/**
 * Middleware to analyze content for toxicity using Google's Perspective API
 * If content exceeds toxicity threshold, it will throw an error
 */

const imageContentAnalyzer = asyncHandler(async (req, _, next) => {
  const threshold = 5; // Set your desired threshold here
  const endpoint = process.env.AZURE_AI_FILTER_ENDPOINT;
  const key = process.env.AZURE_AI_FILTER_KEY;

  const credential = new AzureKeyCredential(key);
  const client = ContentSafetyClient(endpoint, credential);

  console.log("Using Azure AI Content Safety API with endpoint:");
  if (!endpoint || !key) {
    console.error(
      "Error: AZURE_AI_FILTER_ENDPOINT or AZURE_AI_FILTER_KEY is not set in environment variables."
    );
    throw new ApiError(
      500,
      "Content Safety API credentials are not configured."
    );
  }

  if (!req.files || req.files.length === 0) {
    req.compressedImages = [];
    return next(); // No files to process, move to the next middleware
  }

  const result = await FileTypeCheck(req.files);

  if (!result) {
    throw new ApiError(400, "file is not an image");
  }

  for (const file of req.files) {
    const filePath = file.path;

    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const analyzeImageOption = { image: { content: base64Image } };
    const analyzeImageParameters = { body: analyzeImageOption };

    try {
      const result = await client
        .path("/image:analyze")
        .post(analyzeImageParameters);

      if (isUnexpected(result)) {
        console.error(
          "Azure AI Content Safety API returned an unexpected response."
        );
        console.error(result.body);
        throw new ApiError(400, result);
      }

      if (
        result.body.categoriesAnalysis &&
        result.body.categoriesAnalysis.length > 0
      ) {
        console.log("Azure AI Content Safety Image Analysis Results:");
        for (let i = 0; i < result.body.categoriesAnalysis.length; i++) {
          const imageCategoriesAnalysisOutput =
            result.body.categoriesAnalysis[i];
          console.log(
            `  Category: ${imageCategoriesAnalysisOutput.category}, Severity: ${imageCategoriesAnalysisOutput.severity}`
          );
        }
      } else {
        console.log("No categories analysis found in the response.");
      }
    } catch (err) {
      console.error("The image analysis encountered an error:", err);
      if (err.response && err.response.data) {
        console.error("Error details:", err.response.data);
      } else if (err.body) {
        console.error("Error details (from SDK result.body):", err.body);
      }
    }
  }
  next();
});

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
    languages: ["en"], // Try English first
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
            if (
              err.message.includes("language") ||
              err.message.includes("languages")
            ) {
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
    Object.keys(analyzeRequest.requestedAttributes).forEach((attr) => {
      const score = response.data?.attributeScores?.[attr]?.summaryScore?.value;
      if (score !== undefined) {
        scores[attr.toLowerCase()] = score;
      }
    });

    console.log("Content analysis scores:", scores);

    req.contentAnalysis = {
      scores,
      allScores: response.data.attributeScores,
      highestScore:
        Object.values(scores).length > 0
          ? Math.max(...Object.values(scores))
          : 0,
    };

    // Always check threshold if we have any scores
    if (
      Object.keys(scores).length > 0 &&
      req.contentAnalysis.highestScore > TOXICITY_THRESHOLD
    ) {
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
      analysisSkipped: true,
    };
    next();
  }
});

export { analyzeContent, imageContentAnalyzer };
