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
      你是一个专业的英语口语教练，精通 Cambridge FCE 和 IELTS 考试的评分标准。
      请分析用户对以下原句的三次不同维度的Rephrase（换种说法）尝试：
      原句: "${topic}"

      用户的输入：
      - Level 1 (词汇升级): ${lv1}
      - Level 2 (句式转换): ${lv2}
      - Level 3 (地道口语): ${lv3}

      要求：
      请严格以合法的 JSON 格式输出，包含 "level1", "level2", "level3" 三个核心字段。
      在每个 level 字段内部，必须包含 "fce" 和 "ielts" 两个子字段，分别代表【FCE口语卓越水平(Grade A)】和【雅思口语8分水平】。
      在 "fce" 和 "ielts" 内部，均需包含 "evaluation" 和 "samples" 两个字段。

      具体点评与参考答案要求：
      1. evaluation (中文): 针对用户的输入，分别以 FCE 卓越水平和 雅思8分 的标准进行专业点评。
      2. samples (全英文): 
         - FCE (Grade A) 水平：提供不少于3种符合该水平的高分表达，偏向自然、地道、灵动的交流感。
         - 雅思 (Band 8.0) 水平：提供不少于3种符合该水平的高阶表达，偏向用词精准、逻辑严密、学术感强。
         - 注意：L2 的 samples 必须在每个答案开头用中括号标注所使用的句式（如：[强调句] It is...）。
         - 绝对不要附带任何中文解释或翻译。

      示例 JSON 结构：
      {
        "level1": { 
          "fce": { "evaluation": "...", "samples": "1. ...\\n2. ...\\n3. ..." },
          "ielts": { "evaluation": "...", "samples": "1. ...\\n2. ...\\n3. ..." }
        },
        "level2": { 
          "fce": { "evaluation": "...", "samples": "[被动语态] ...\\n[强调句] ...\\n[倒装句] ..." },
          "ielts": { "evaluation": "...", "samples": "[从句] ...\\n[非谓语] ...\\n[虚拟语气] ..." }
        },
        "level3": {
          "fce": { "evaluation": "...", "samples": "..." },
          "ielts": { "evaluation": "...", "samples": "..." }
        }
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
