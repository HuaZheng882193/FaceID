/**
 * 核心人脸识别模拟服务 (SiliconFlow API 版)
 * 使用 Bearer token 认证
 */
const API_BASE_URL = "https://api.siliconflow.cn/v1/chat/completions";
const API_KEY = "sk-caranifnmuxtvwlwfpmausnwwgpyshvouurxlxgupxykqidk";
const MODEL = "Qwen/Qwen3-VL-8B-Instruct";

/**
 * 分析人脸图像。
 * 利用 QwQ-32B 的视觉理解能力提取面部特征和环境评价。
 */
export async function analyzeFace(base64Image: string): Promise<string> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                },
              },
              {
                type: "text",
                text: `作为人工智能计算机视觉专家，为教育模拟分析这张人脸。
请用中文描述：
1. 检测到的关键特征点（如：瞳孔中心、鼻尖、嘴角）。
2. 机器如何将这些特征转换为数值化的"面部指纹"（嵌入向量）。
3. 拍摄的光照和质量评价。
语言要专业且适合学生阅读。`,
              },
            ],
          },
        ],
        stream: false,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || "分析结果生成失败。";
  } catch (error) {
    console.error("SiliconFlow Analyze Error:", error);
    return "分析过程中发生错误，请检查网络连接或 API 配置。";
  }
}

/**
 * 对比两张人脸图像。
 * 模拟 1:1 人脸验证过程，返回匹配结果。
 */
export async function compareFaces(
  enrollmentImage: string,
  loginImage: string
): Promise<{ match: boolean; similarity: number; explanation: string }> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: enrollmentImage,
                },
              },
              {
                type: "image_url",
                image_url: {
                  url: loginImage,
                },
              },
              {
                type: "text",
                text: '对比这两张图片中的人脸。它们是同一个人吗？请分析它们的面部特征相似度，并以 JSON 格式返回结果。JSON格式：{"match": true/false, "similarity": 0-100的数字, "explanation": "详细的中文说明"}',
              },
            ],
          },
        ],
        stream: false,
        max_tokens: 4096,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    // 尝试解析JSON响应
    try {
      const parsed = JSON.parse(content);
      return {
        match: parsed.match || false,
        similarity: parsed.similarity || 0,
        explanation: parsed.explanation || "解析响应失败",
      };
    } catch (parseError) {
      // 如果不是有效的JSON，尝试从文本中提取信息
      console.warn("Response is not valid JSON, trying to extract information");
      return {
        match:
          content.includes("是") ||
          content.includes("true") ||
          content.includes("相同"),
        similarity: 75, // 默认相似度
        explanation: content,
      };
    }
  } catch (error) {
    console.error("SiliconFlow Compare Error:", error);
    return {
      match: false,
      similarity: 0,
      explanation: "人脸比对失败，无法提取有效的比对特征。",
    };
  }
}
