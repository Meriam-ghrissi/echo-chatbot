import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userScheme = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    name: {type: Number, default: 20},
})

// Hash password before saving
userSchema.pre('save', async function (params) {
    if(!this.isModified('password')) {
        return next ()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next();
})

const User = mongoose.model ('User', userScheme);
export default User;