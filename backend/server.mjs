import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

// Load environment variables
dotenv.config();

// Validate environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware setup
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running with Gemini AI' });
});

// Main endpoint for generating response
app.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('Received text:', text);

    // Get text completion from Gemini
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // Prefer flash (free tier supported), fallback to pro if enabled
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // const prompt = `You are a helpful and computer science student friendly AI assistant. Keep your responses concise, simple,and short. User says: ${text}`;
//     const prompt = `
// You are a helpful and computer science student friendly AI assistant. 
// Keep your responses concise, simple, and short. 
// Always answer in plain text only, without using markdown, bold, italics, backticks, or special characters like *, ", ', or \`.
// User says: ${text}
// `;
    const prompt = `
You are a helpful AI assistant for computer science students. 

Rules:
1. Only answer questions related to computer science (programming, algorithms, data structures, operating systems, databases, theory of computation, networking, AI/ML, etc.).
2. If the user asks something outside computer science, politely respond with:
   I can only answer computer science related questions.
3. If the user asks about LearnReinforced, always respond with:
   LearnReinforced is a gamified learning platform that uses AI and reinforcement learning to make computer science learning fun with coding quests, challenges, and an AI tutor.
4. Always give clear, simple, concise explanations in plain text only.
5. Do NOT use markdown formatting, bold (**), italics (*), quotes ("), or backticks (\`).
6. Use plain sentences and examples when needed, but keep everything free of special characters.
7. If the user asks about who built LearnReinforced, always respond with:
   LearnReinforced was built by Group 11 Students of Atria Institute of Technology from the department of I S E 'B' under the guidance of Dr.Kavitha S Patil 
User says: ${text}
`;


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const geminiResponse = response.text();
    
    console.log('Gemini response:', geminiResponse);

    // Send response back for browser TTS
    res.json({
      text: geminiResponse,
      success: true
    });

  } catch (error) {
    console.error('Error processing request:', error);
    
    res.status(500).json({ 
      error: 'Error generating response: ' + (error.message || 'Unknown error'),
      success: false
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log(`🤖 Using Gemini AI API`);
  console.log(`🔊 Using browser-based Text-to-Speech`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
});