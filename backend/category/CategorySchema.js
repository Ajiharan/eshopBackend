import mongoose from "mongoose";
import moment from "moment";
const CategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: moment().format("LLLL"),
  },
});

export default mongoose.model("categoryschemas", CategorySchema);
