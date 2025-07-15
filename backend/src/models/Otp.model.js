import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
const otpSchema = new mongoose.Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
        sparse: true  // Allow null values since registration won't have an owner
    },
    tempEmail: {
        type: String,
        index: true,
        sparse: true  // Allow null values since authenticated requests won't have tempEmail
    },
    otp: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    }
}, { timestamps: true });

otpSchema.pre("save", async function (next) {
    this.otp = await bcrypt.hash(this.otp,10)
    next()
})

otpSchema.methods.isOtpCorrect = async function(otp){
    return await bcrypt.compare(otp, this.otp)
}
export const Otp = new mongoose.model("Otp", otpSchema);
