"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const checkout_routes_1 = __importDefault(require("./routes/checkout.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/events', event_routes_1.default);
app.use('/api/checkout', checkout_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
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
            const token = jsonwebtoken_1.default.sign({ email, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1d' });
            res.json({ token, message: 'Login successful' });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
