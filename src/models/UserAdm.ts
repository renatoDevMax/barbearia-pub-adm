import mongoose from 'mongoose';

const userAdmSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true
  },
  pass: {
    type: String,
    required: true
  }
}, {
  collection: 'userAdm'
});

// Modelo base sem especificar banco
const UserAdm = mongoose.models.UserAdm || mongoose.model('UserAdm', userAdmSchema);

export default UserAdm;
