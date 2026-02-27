import OpenAI from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';

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
      你是一个专业的雅思/FCE英语口语教练。
      请分析用户对以下句子的三次Rephrase（换种说法）尝试：
      原句: "${topic}"

      用户的输入：
      - Level 1: ${lv1}
      - Level 2: ${lv2}
      - Level 3: ${lv3}

      要求：
      请严格以合法的 JSON 格式输出，必须包含以下两个字段：
      1. "evaluation": (使用中文) 针对用户的三个level进行专业点评。指出语法错误、用词优点，并给出一个预估的雅思口语分数。排版要清晰易读。
      2. "samples": (使用中文加英文) 提供不少于3种更地道、更高级的参考答案，并附带简短的中文解析说明好在哪里。

      不要输出任何除了 JSON 以外的内容。
    `;

    // 使用 response_format 强制 OpenAI 输出 JSON
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" }
    });
    
    const text = completion.choices[0].message.content;
    if (!text) {
      throw new Error("No response");
    }

    // 将 AI 返回的 JSON 文本解析成对象并返回给前端
    const parsedData = JSON.parse(text);
    res.status(200).json(parsedData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '解析失败，请检查 API Key 或稍后重试' });
  }
}
