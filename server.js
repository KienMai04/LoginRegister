const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./src/models/User');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const Todo = require('./src/models/Todo'); 

const systemLog = (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const timestamp = new Date().toISOString();
  
  console.log(`[SYSTEM LOG] [${timestamp}] ${method} request to ${url}`);
  
  next(); 
};

const userLog = (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const user = req.body.username || 'unknown';  
  const timestamp = new Date().toISOString();

  console.log(`[USER LOG] [${timestamp}] ${method} request to ${url} by ${user}`);
  
  next(); 
};

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']; 

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  if (token !== 'your-expected-token') { 
    return res.status(403).json({ message: 'Invalid token' });
  }

  next(); 
};

app.use(systemLog);

app.post('/register', userLog);  
app.post('/login', userLog);     

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

app.get('/users', async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Invalid Username or Password' });
  }

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      return res.status(200).json({ message: 'Login successful', user });
    } else {
      return res.status(400).json({ message: 'Invalid Username or Password' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});

app.post('/todos', authenticate, async (req, res) => {
  const { text, userId } = req.body;
  if (!text || !userId) return res.status(400).json({ message: 'Missing text or userId' });

  try {
    const todo = new Todo({ text, done: false, user: userId });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create todo', error: error.message });
  }
});

app.get('/todos', authenticate, async (req, res) => {
  const { user } = req.query;
  if (!user) return res.status(400).json({ message: 'Missing user ID' });

  try {
    const todos = await Todo.find({ user });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch todos', error });
  }
});

app.put('/todos/:id', authenticate, async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update todo', error });
  }
});

app.delete('/todos/:id', authenticate, async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete todo', error });
  }
});


app.listen(3500, () => console.log('Server running on http://localhost:3500'));

