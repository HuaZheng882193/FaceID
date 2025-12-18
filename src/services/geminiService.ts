
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

/**
 * 核心人脸识别模拟服务 (Google Gemini API 版)
 * 使用环境预置的 API_KEY 确保授权成功。
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 分析人脸图像。
 * 利用 Gemini 3 的视觉理解能力提取面部特征和环境评价。
 */
export async function analyzeFace(base64Image: string): Promise<string> {
  try {
    const data = base64Image.split(',')[1] || base64Image;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: data,
              },
            },
            {
              text: `作为人工智能计算机视觉专家，为教育模拟分析这张人脸。
请用中文描述：
1. 检测到的关键特征点（如：瞳孔中心、鼻尖、嘴角）。
2. 机器如何将这些特征转换为数值化的“面部指纹”（嵌入向量）。
3. 拍摄的光照和质量评价。
语言要专业且适合学生阅读。`
            },
          ],
        },
      ],
    });

    return response.text || "分析结果生成失败。";
  } catch (error) {
    console.error("Gemini Analyze Error:", error);
    return "分析过程中发生错误，请检查网络连接或 API 配置。";
  }
}

/**
 * 对比两张人脸图像。
 * 模拟 1:1 人脸验证过程，使用结构化 JSON 返回匹配结果。
 */
export async function compareFaces(enrollmentImage: string, loginImage: string): Promise<{ match: boolean; similarity: number; explanation: string }> {
  try {
    const enrollData = enrollmentImage.split(',')[1] || enrollmentImage;
    const loginData = loginImage.split(',')[1] || loginImage;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: enrollData,
              },
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: loginData,
              },
            },
            {
              text: "对比这两张图片中的人脸。它们是同一个人吗？请分析它们的面部特征相似度，并以 JSON 格式返回结果。"
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            match: {
              type: Type.BOOLEAN,
              description: "如果两张人脸被判定为同一人，则为 true。"
            },
            similarity: {
              type: Type.NUMBER,
              description: "相似度分数，范围 0 到 100。"
            },
            explanation: {
              type: Type.STRING,
              description: "比对结果的详细中文说明。"
            }
          },
          required: ["match", "similarity", "explanation"],
        },
      },
    });

    const resultText = response.text || "{}";
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini Compare Error:", error);
    return { 
      match: false, 
      similarity: 0, 
      explanation: "人脸比对失败，无法提取有效的比对特征。" 
    };
  }
}
