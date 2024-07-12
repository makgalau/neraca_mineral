import mongoose, { Schema, Document } from 'mongoose';

// Interface untuk mendefinisikan struktur data pengguna
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  organisasi:string;
  tipeUser: string;
  key:string;
}

// Schema MongoDB untuk pengguna
const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  organisasi: {type: String, required: true },
  tipeUser: { type: String, required: true },
  key: {type: String, require: false}
});

// Membuat model User dari schema
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
