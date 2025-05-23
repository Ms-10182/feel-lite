import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import mongoosePaginate from "mongoose-paginate-v2"

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        trim:true,
        required:[true,"username is required"],
    },
    email:{
        type:String,
        required:[true,"email is required"],
        lowercase:true,
        unique:true,
        trim:true,
    },
    avatar:{
        type:String
    },
    coverImage:{
        type:String
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken:{
        type:String,
    },
    logoutPin:{
        type:Number,
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    banReason: {
        type: String,
        default: null
    },
    banExpiresAt: {
        type: Date,
        default: null
    },
    // For elevated privileges
    role: {
        type: String,
        enum: ["user", "moderator", "admin"],
        default: "user"
    }
},{timestamps:true})


userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id:this._id,
        logoutPin:this.logoutPin,
    },process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign({
        _id:this._id,
        logoutPin:this.logoutPin,
    },process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}

userSchema.plugin(mongoosePaginate);
export const User = mongoose.model("User", userSchema)