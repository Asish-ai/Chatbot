import express from 'express';
import OpenAI from "openai";
import * as dotenv from "dotenv";
import cors from 'cors';

console.log("API Key:", process.env.OPENAI_API_KEY);


dotenv.config();

const app = express();
const PORT = 5000;

app.use(express.json()); // To parse JSON body in requests

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure this environment variable is set
});

app.post('/', async (req, res) => {
    try {
        const { prompt } = req.body;

        const completion = await openai.chat.completions.create({
            model: "gpt-4", // Correct model name
            messages: [
                { role: "user", content: prompt }
            ],
        });

        res.status(200).json({
            bot: completion.choices[0].message.content,
        });
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
