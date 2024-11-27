import express from 'express';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();

// Very permissive CORS for debugging
const corsOptions = {
  origin: '*', // Be careful, this is not secure for production
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Detailed logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Request Body:', req.body);
  next();
});

// Initialize Groq (using OpenAI library)
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// Dedicated chat endpoint with extensive error handling
app.post('/chat', async (req, res) => {
  try {
    // Validate input
    const { prompt } = req.body;
    
    console.log('Received Prompt:', prompt);
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: "Invalid prompt. Please provide a valid string." 
      });
    }

    // Conversation messages
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

    // Call Groq API with error logging
    let response;
    try {
      response = await openai.chat.completions.create({
        model: "llama3-8b-8192", 
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048
      });
    } catch (apiError) {
      console.error('Groq API Specific Error:', apiError);
      return res.status(500).json({
        error: 'API Call Failed',
        details: apiError.message,
        fullError: apiError
      });
    }

    // Extract and send response
    if (response && response.choices && response.choices.length > 0) {
      const botResponse = response.choices[0].message.content.trim();
      
      console.log('Bot Response:', botResponse);
      
      res.status(200).json({
        bot: botResponse
      });
    } else {
      console.error('Unexpected API Response Structure:', response);
      res.status(500).json({
        error: 'Unexpected response from AI',
        details: 'No valid response received'
      });
    }
    
  } catch (error) {
    // Catch-all error handler
    console.error('Unexpected Server Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      details: error.message,
      fullError: error
    });
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
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port http://localhost:${PORT}`));