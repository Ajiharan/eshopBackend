import mongoose from "mongoose";
const AdminSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  emailId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    default: null,
  },
});

export default mongoose.model("adminschemas", AdminSchema);
