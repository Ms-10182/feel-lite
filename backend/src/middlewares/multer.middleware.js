import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log("Multer processing file:", file.fieldname);
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
export const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log("Received field:", file.fieldname);
    // Allow only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
})