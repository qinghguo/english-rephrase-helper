import OpenAI from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';

// 初始化 OpenAI，自动读取 Vercel 里设置好的 OPENAI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

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

    // 调用 GPT 模型（这里默认使用性价比最高的 gpt-3.5-turbo，如果你有 gpt-4 的权限也可以改名）
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo", 
    });
    
    const text = completion.choices[0].message.content;
    res.status(200).json({ analysis: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
