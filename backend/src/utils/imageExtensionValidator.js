import { fileTypeFromFile } from "file-type";
import { allowedFilesSet } from "../constants.js";
import pLimit from "p-limit"; // To limit concurrency
import { ApiError } from "./ApiError.js";

const FileTypeCheck = async (files) => {

  const limit = pLimit(5); // Limit to 5 concurrent tasks

  const tasks = files.map((file) =>
    limit(async () => {
      try {
        const type = await fileTypeFromFile(file.path);

        if (!type || !allowedFilesSet.has(type.ext)) {
          throw new Error(`Invalid file type: ${file.path}`);
        }

        return { file: file.path, valid: true };
      } catch (error) {
        return { file: file.path, valid: false, error: error.message };
      }
    })
  );

  const results = await Promise.all(tasks);

  // Check if any files are invalid
  const invalidFiles = results.filter((result) => !result.valid);

  if (invalidFiles.length > 0) {
    const errorMessages = invalidFiles.map(
      (file) => `File: ${file.file}, Error: ${file.error}`
    );
    throw new ApiError(400,`Invalid file types:\n${errorMessages.join("\n")}`)
  }

  return true; // Return validation results
};

export { FileTypeCheck };
