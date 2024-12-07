const express = require('express');
const cors = require('cors');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

app.use(cors({
    origin: true, 
    credentials: true 
}));

app.use(express.json());

app.use('/api/category', categoryRoutes);

app.listen(3003, () => {
    console.log('User Service running on http://localhost:3003');
});