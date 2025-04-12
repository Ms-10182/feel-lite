import sharp from "sharp";
import fs from "fs/promises";

const compressImagesMiddleware = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      req.compressedImages = []
      return next(); // No files to process, move to the next middleware
    }

    const compressedImages = [];

    for (const file of req.files) {
      const name = file.path.split("\\").pop();
      const outputPath = `./public/tempCompressed/${name}`;
      sharp.cache(false); // Disable sharp cache
      // Compress the image
      await sharp(file.path)
        .toFormat("jpeg", { mozjpeg: true })
        .jpeg({ quality: 70 })
        .toFile(outputPath);

      // Add the compressed image path to the array
      compressedImages.push(outputPath);

      // Delete the original file
      try {
        await fs.unlink(file.path);
        console.log(`Deleted original file: ${file.path}`);
      } catch (error) {
        console.error(`Error deleting file ${file.path}:`, error);
      }
    }

    // Attach the compressed images to the request object
    req.compressedImages = compressedImages;

    next(); // Move to the next middleware
  } catch (error) {
    console.error("Error in compressImagesMiddleware:", error);
    next(error); // Pass the error to the error-handling middleware
  }
};

export { compressImagesMiddleware };