import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextApiRequest, NextApiResponse } from 'next';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, lv1, lv2, lv3 } = req.body;

    const prompt = `
      You are an expert IELTS/FCE English Speaking Coach. 
      Analyze the user's three attempts to rephrase this sentence: "${topic}"

      User's Input:
      - Level 1 (Vocab): ${lv1}
      - Level 2 (Grammar): ${lv2}
      - Level 3 (Native): ${lv3}

      Please provide:
      1. **Evaluation**: Brief feedback for each level.
      2. **Score**: Estimated IELTS Band.
      3. **Stress Guide**: Rewrite each of their sentences and use **BOLD** to indicate sentence stress.
      4. **3 Professional Samples**: Provide 3 high-level alternatives with stress markings.
      
      Formatting: Markdown.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.status(200).json({ analysis: response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
