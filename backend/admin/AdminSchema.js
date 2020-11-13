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
});

export default mongoose.model("AdminSchema", AdminSchema);
