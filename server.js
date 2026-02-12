const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './'))); // Serve static files from root for now

// Mock Database (In-memory for this demo, usually would be a real DB)
const db = {
    orders: [],
    messages: [],
    products: [
        {
            id: 1,
            name: "Ethiopian Yirgacheffe",
            description: "Floral notes with bright citrus acidity and a tea-like body. Light roast.",
            price: 18.91,
            tag: "BESTSELLER",
            rating: 4.5,
            image: "https://i.pinimg.com/736x/b0/4d/18/b04d18874421fad2a349ea6d8fca7569.jpg"
        },
        {
            id: 2,
            name: "Colombian Supremo",
            description: "Balanced body with nutty undertones and a clean, sweet finish. Medium roast.",
            price: 16.10,
            tag: "POPULAR",
            rating: 4.0,
            image: "https://i.pinimg.com/736x/06/b8/9d/06b89d194bc96014019ad70eada9ee68.jpg"
        },
        {
            id: 3,
            name: "Sumatra Mandheling",
            description: "Earthy profile with low acidity and a heavy, syrupy body. Dark roast.",
            price: 17.50,
            tag: "BOLD",
            rating: 4.8,
            image: "https://i.pinimg.com/736x/aa/3d/4d/aa3d4defa8112efe2c198acdac395ffa.jpg"
        }
    ]
};

// API Endpoints
app.get('/api/products', (req, res) => {
    res.json(db.products);
});

app.post('/api/orders', (req, res) => {
    const { items, total, customer } = req.body;
    const newOrder = {
        id: db.orders.length + 1,
        items,
        total,
        customer,
        status: 'pending',
        timestamp: new Date()
    };
    db.orders.push(newOrder);
    console.log('New Order Received:', newOrder);
    res.status(201).json({ message: 'Order placed successfully!', orderId: newOrder.id });
});

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    const newMessage = {
        id: db.messages.length + 1,
        name, email, message,
        timestamp: new Date()
    };
    db.messages.push(newMessage);
    console.log('New Message Received:', newMessage);
    res.status(201).json({ message: 'Message sent successfully!' });
});

app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    console.log('New Newsletter Subscription:', email);
    res.status(201).json({ message: 'Subscribed to coffee updates!' });
});

app.get('/api/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    const results = db.products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
    );
    res.json(results);
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
