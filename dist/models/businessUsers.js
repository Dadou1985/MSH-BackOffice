import mongoose from 'mongoose';
const businessUserSchema = new mongoose.Schema({
    country: { type: String },
    createdAt: { type: Date },
    username: { type: String },
    website: { type: String },
    mail: { type: String },
    phone: { type: String },
    adresse: { type: String },
    email: { type: String },
    password: { type: String },
    pricingModel: { type: String },
    language: { type: String },
    base64Url: { type: String },
    adminStatus: { type: Boolean, default: false },
    code_postal: { type: String },
    appLink: { type: String },
    city: { type: String },
    hotelDept: { type: String },
    classement: { type: String },
    logo: { type: String },
    hotelId: { type: String },
    hotelName: { type: String },
    room: { type: String },
    hotelRegion: { type: String }
}, { timestamps: true });
const BusinessUser = mongoose.model('businessUser', businessUserSchema, 'businessUsers');
export default BusinessUser;
