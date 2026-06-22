import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import eventRoutes from './routes/event.routes';
import checkoutRoutes from './routes/checkout.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Admin login route
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

  try {
    // In a real production app, we would query the database and use bcrypt.compare()
    // For this implementation, we use the requested credentials and generate a real JWT.
    if (email === 'admin@hahahihifest.com' && password === 'admin123') {
      const token = jwt.sign({ email, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token, message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
