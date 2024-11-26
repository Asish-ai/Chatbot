import express from 'express';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();

// Comprehensive CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || origin === 'http://localhost:3000' || origin === 'http://localhost:5173') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Dedicated chat endpoint
app.post('/chat', async (req, res) => {
  try {
    // Validate input
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: "Invalid prompt. Please provide a valid string." 
      });
    }

    // Implement conversation context if needed
    const messages = [
      { 
        role: "system", 
        content: "You are a helpful, friendly, and concise AI assistant." 
      },
      { 
        role: "user", 
        content: prompt 
      }
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
  messages: [],
  response_format: {
    "type": "text"
  },
  temperature: 1,
  max_tokens: 2048,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0
    });

    // Extract and send response
    const botResponse = response.choices[0].message.content.trim();
    
    res.status(200).json({
      bot: botResponse
    });
    
  } catch (error) {
    // Comprehensive error handling
    console.error('OpenAI API Error:', error);
    
    if (error.response) {
      // OpenAI specific error
      console.error(error.response.status);
      console.error(error.response.data);
      
      return res.status(error.response.status).json({
        error: 'OpenAI API Error',
        details: error.response.data
      });
    } else if (error instanceof OpenAI.APIError) {
      // Handle API-specific errors
      return res.status(500).json({
        error: 'OpenAI API Error',
        details: error.message
      });
    } else {
      // Generic server error
      return res.status(500).json({
        error: 'Internal Server Error',
        details: error.message
      });
    }
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(5001, () => console.log('server is running on port http://localhost:5001'));
  