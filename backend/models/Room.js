const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },

    bab: {
      type: String,
      required: true,
    },

    dialect: {
      type: String,
      required: true,
    },

    totalSoal: {
      type: Number,
      default: 5,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", roomSchema);