const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: true, 
    credentials: true 
}));

app.use('/api/auth', createProxyMiddleware({ 
    target: 'http://localhost:3001/api/auth', 
    changeOrigin: true,
}));
app.use('/api/user', createProxyMiddleware({ 
    target: 'http://localhost:3002/api/user', 
    changeOrigin: true,
}));
app.use('/api/product', createProxyMiddleware({ 
    target: 'http://localhost:3003/api/product', 
    changeOrigin: true,
}));

app.listen(3000, () => {
    console.log('API Gateway running on http://localhost:3000');
});