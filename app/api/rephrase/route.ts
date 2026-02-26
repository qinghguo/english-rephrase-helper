import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  const { topic, lv1, lv2, lv3 } = await req.json();

  const prompt = `
    You are an expert IELTS/FCE English Speaking Coach. 
    Analyze the user's three attempts to rephrase this sentence: "${topic}"

    User's Input:
    - Level 1 (Vocab): ${lv1}
    - Level 2 (Grammar): ${lv2}
    - Level 3 (Native): ${lv3}

    Please provide:
    1. **Evaluation**: Brief feedback for each level (accuracy, tone).
    2. **Score**: Estimated IELTS Band.
    3. **Stress Guide**: Rewrite each of their sentences and use **BOLD** to indicate sentence stress (e.g., I **really** like it).
    4. **3 Professional Samples**: Provide 3 high-level alternatives with stress markings.
    
    Use a friendly, encouraging tone. Formatting: Markdown.
  `;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return Response.json({ analysis: response.text() });
}
