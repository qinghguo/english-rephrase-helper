import OpenAI from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const prompt = `
      你是一个雅思和剑桥FCE考官。
      请随机生成一句符合雅思和或FCE中常见的简单陈述句（B1-B2难度，长度10-15词）。
      这句话将作为让学生进行 Rephrase（换种说法）练习的原句。
      话题请从以下领域随机抽取：环保、科技、生活方式、职场、教育、旅游、动物保护、社交等。
      
      要求：直接输出这句英文，不要加引号，不要有任何其他解释或中文。
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const topic = completion.choices[0].message.content?.trim();
    res.status(200).json({ topic });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取题目失败' });
  }
}
