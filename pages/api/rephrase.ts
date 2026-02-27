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
    const { topic, lv1, lv2, lv3, standard } = req.body;
    const standardText = standard === 'fce' ? 'Cambridge FCE 卓越水平 (Grade A)' : '雅思口语 8.0 分水平';

    const prompt = `
      你是一个专业的英语口语教练，精通 ${standardText} 的评分标准。
      请分析用户对以下原句的三次不同维度的Rephrase（换种说法）尝试：
      原句: "${topic}"

      用户的输入：
      - Level 1: ${lv1}
      - Level 2: ${lv2}
      - Level 3: ${lv3}

      要求：
      请严格以合法的 JSON 格式输出，包含 "level1", "level2", "level3" 三个核心字段。
      在每个 level 字段内部，包含 "evaluation" 和 "samples" 两个子字段。

      具体要求：
      1. evaluation (必须完全使用中文): 针对用户的输入进行专业点评。
      2. samples (全英文): 提供不少于3种符合 ${standardText} 的高分表达。绝对不要附带中文解释。
      
      【加粗高亮指令】（极其重要）：
      在 samples 的全英文答案中，必须使用 Markdown 加粗语法（**加粗的内容**）来突出核心得分点：
      - Level 1: 必须加粗 **替换后的高级词汇**。
      - Level 2: 必须加粗 **核心句式结构词**（并在句首保留 [句式名] 的标注）。
      - Level 3: 必须加粗 **地道的俚语、连接词或词组**。

      示例 JSON：
      {
        "level1": { "evaluation": "中文点评...", "samples": "1. I am **fascinated by**...\\n2. ..." },
        "level2": { "evaluation": "中文点评...", "samples": "[强调句] **It is** the strategy **that**...\\n..." },
        "level3": { "evaluation": "中文点评...", "samples": "1. It is **right up my alley**...\\n..." }
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
    res.status(500).json({ error: '解析失败，请检查 API Key 或稍后重试' });
  }
}
