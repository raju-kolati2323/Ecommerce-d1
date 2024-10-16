require('dotenv').config();
const cloudinary = require("cloudinary").v2;

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
});

// Options for uploading
const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
};

// Function to upload a single image
const uploadImage = (image) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, opts, (error, result) => {
      if (result && result.secure_url) {
        console.log(result.secure_url);
        return resolve(result.secure_url);
      }
      console.log(error.message); 
      return reject({ message: error.message }); 
    });
  });
};

module.exports = {
  uploadImage,
};
