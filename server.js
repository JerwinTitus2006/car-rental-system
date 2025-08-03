const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// Middleware with IP restriction
const allowedIPs = ['223.237.186.101/32', '127.0.0.1'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedIPs.some(ip => origin.includes(ip))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(
  'enter your url',
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Rental Schema
const rentalSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  rentalDate: String,
  numberOfDays: Number
});

const Rental = mongoose.model('Rental', rentalSchema);

// API Routes

// Add new rental
app.post('/api/rentals', async (req, res) => {
  try {
    const rental = new Rental(req.body);
    await rental.save();
    res.status(201).json({ message: 'Rental saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error saving rental' });
  }
});

// Get all rentals
app.get('/api/rentals', async (req, res) => {
  try {
    const rentals = await Rental.find();
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching rentals' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
