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
      请分析用户对以下原句的三次不同维度的Rephrase（换种说法）尝试：
      原句: "${topic}"

      用户的输入：
      - Level 1 (词汇升级): ${lv1}
      - Level 2 (句式转换): ${lv2}
      - Level 3 (地道口语): ${lv3}

      要求：
      请严格以合法的 JSON 格式输出，必须包含 "level1", "level2", "level3" 三个核心字段。
      在这三个字段内部，必须包含 "evaluation" 和 "samples" 两个子字段。

      具体关注点与点评要求：
      1. level1：
         - evaluation (中文): 专注点评【词汇替换】是否准确、高级。
         - samples (全英文): 提供不少于 3 种侧重【词汇升级】的高分参考答案。**不要附带任何中文解释或翻译**。
      2. level2：
         - evaluation (中文): 专注点评【句式结构】（如被动语态、从句、强调句、非谓语等）的运用。
         - samples (全英文): 提供不少于 3 种侧重【句式变换】的高分参考答案。**不要附带中文解释**，但**必须在每个答案开头用中括号标注所使用的句式**（例如：[强调句] It is the strategy that... / [被动语态] Board games are often...）。
      3. level3：
         - evaluation (中文): 专注点评【地道感】（如俚语、固定搭配、连接词、phrasal verbs等）。
         - samples (全英文): 提供不少于 3 种侧重【地道口语表达】的高分参考答案。**不要附带任何中文解释或翻译**。

      示例 JSON 结构：
      {
        "level1": { "evaluation": "...", "samples": "1. ...\\n2. ...\\n3. ..." },
        "level2": { "evaluation": "...", "samples": "[句式A] ...\\n[句式B] ...\\n[句式C] ..." },
        "level3": { "evaluation": "...", "samples": "1. ...\\n2. ...\\n3. ..." }
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
