// api/connectDb.js
import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    // Gunakan koneksi yang sudah ada
    return;
  }
  // Buat koneksi baru ke MongoDB
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Terhubung ke MongoDB");
};

export default async function handler(req, res) {
  await connectDB();
  res.status(200).json({ message: 'Database terhubung dengan sukses' });
}
