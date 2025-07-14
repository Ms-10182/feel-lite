import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
const otpSchema = new mongoose.Schema({
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User",
        index:true
    },
    otp:{
        type:String,
    },
    expiry:{
        type:Date
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
