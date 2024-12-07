const express = require('express');
const cors = require('cors');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors({
    origin: true, 
    credentials: true 
}));

app.use(express.json());

app.use('/api/category', categoryRoutes);
app.use('/api/product', productRoutes);

app.listen(3003, () => {
    console.log('Product Service running on http://localhost:3003');
});