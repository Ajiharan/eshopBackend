import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  productCount: {
    type: Number,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  ImageUrl: {
    type: String,
    required: true,
  },
});

export default mongoose.model("productschemas", productSchema);
