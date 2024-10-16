const Feature = require("../../models/Feature");
const { uploadImage } = require("../../helpers/cloudinary");

const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Please upload the image!",
      });
    }

    // console.log("Uploading image:", image);

    const uploadedImageUrl = await uploadImage(image);

    const featureImages = new Feature({
      image: uploadedImageUrl,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// Delete a feature image by ID
const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request parameters

    const deletedImage = await Feature.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};


module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };
