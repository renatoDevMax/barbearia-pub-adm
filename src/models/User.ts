import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  userPhone: {
    type: String,
    required: false,
  },
  userDatas: {
    type: [Date],
    default: [],
  },
  // Campos do NextAuth
  name: String,
  email: String,
  image: String,
}, {
  timestamps: true,
  collection: 'users'
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
