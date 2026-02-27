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
    
    // 动态判断当前用户选择的标准
    const standardText = standard === 'fce' ? 'Cambridge FCE 卓越水平 (Grade A)' : '雅思口语 8.0 分水平';

    const prompt = `
      你是一个专业的英语口语教练，精通 ${standardText} 的评分标准。
      请分析用户对以下原句的三次不同维度的Rephrase（换种说法）尝试：
      原句: "${topic}"

      用户的输入：
      - Level 1 (词汇升级): ${lv1}
      - Level 2 (句式转换): ${lv2}
      - Level 3 (地道口语): ${lv3}

      要求：
      请严格以合法的 JSON 格式输出，包含 "level1", "level2", "level3" 三个核心字段。
      在每个 level 字段内部，包含 "evaluation" 和 "samples" 两个子字段。

      具体点评与参考答案要求（严格基于 ${standardText}）：
      1. evaluation (必须完全使用中文): 针对用户的输入进行专业点评。指出优点和可以改进的地方。
      2. samples (全英文): 
         - 提供不少于3种符合 ${standardText} 的高分表达。
         - 注意：Level 2 的 samples 必须在每个答案开头用中括号标注所使用的句式（如：[强调句] It is...）。
         - 绝对不要附带任何中文解释或翻译。

      示例 JSON 结构：
      {
        "level1": { "evaluation": "中文点评内容...", "samples": "1. ...\\n2. ...\\n3. ..." },
        "level2": { "evaluation": "中文点评内容...", "samples": "[被动语态] ...\\n[强调句] ...\\n[倒装句] ..." },
        "level3": { "evaluation": "中文点评内容...", "samples": "1. ...\\n2. ...\\n3. ..." }
      }
      绝对不要输出任何除了 JSON 以外的内容。
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" }
    });
    
    const text = completion.choices[0].message.content;
    if (!text) {
      throw new Error("No response");
    }

    const parsedData = JSON.parse(text);
    res.status(200).json(parsedData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '解析失败，请检查 API Key 或稍后重试' });
  }
}
