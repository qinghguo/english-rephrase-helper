import OpenAI from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { topic, standard } = req.body;
    const standardText = standard === 'fce' ? 'Cambridge FCE 卓越水平 (Grade A)' : '雅思口语 8.0 分水平';

    const prompt = `
      你是一个专业的英语口语教练。用户给出一个简单的英文句子，请你将其直接改写为符合 ${standardText} 的高分表达。
      原句: "${topic}"

      要求：
      请严格以合法的 JSON 格式输出，包含 "level1", "level2", "level3" 三个核心字段。
      在每个 level 字段内部，只包含 "samples" 字段（全英文）。

      改写方向与【加粗指令】（极其重要）：
      1. level1 (samples): 提供不少于3种侧重【词汇升级】的高分表达。必须加粗(**)替换后的高级词汇。
      2. level2 (samples): 提供不少于3种侧重【句式变换】的高分表达。句首需带[句式名]标注，并加粗(**)核心结构词。
      3. level3 (samples): 提供不少于3种侧重【地道口语】的高分表达。必须加粗(**)地道俚语或短语。

      绝对不要附带中文解释。
      示例 JSON:
      {
        "level1": { "samples": "1. I am **fascinated by**...\\n2. ..." },
        "level2": { "samples": "[强调句] **It is** the strategy **that**...\\n..." },
        "level3": { "samples": "1. It is **right up my alley**...\\n..." }
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" }
    });
    
    const text = completion.choices[0].message.content;
    if (!text) throw new Error("No response");

    res.status(200).json(JSON.parse(text));
  } catch (error) {
    res.status(500).json({ error: '解析失败，请检查 API Key' });
  }
}
