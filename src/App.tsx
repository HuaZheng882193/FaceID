import React, { useState } from "react";
import { LabStep, EnrollmentData, LabRecord } from "./types";
import ImageUploader from "./components/ImageUploader";
import { analyzeFace, compareFaces } from "./services/geminiService";

// 分析报告组件
const AnalysisReport: React.FC<{ text: string }> = ({ text }) => {
  // 解析分析文本，按段落和要点分割
  const parseAnalysis = (text: string) => {
    const sections = text.split('\n').filter(line => line.trim());

    return sections.map((section, index) => {
      // 检查是否是编号列表项
      const numberedMatch = section.match(/^(\d+)\.\s*(.+)/);
      if (numberedMatch) {
        return {
          type: 'numbered',
          number: numberedMatch[1],
          content: numberedMatch[2],
          key: `section-${index}`
        };
      }

      // 检查是否包含关键词来分类
      if (section.includes('特征点') || section.includes('瞳孔') || section.includes('鼻尖') || section.includes('嘴角')) {
        return {
          type: 'features',
          content: section,
          key: `section-${index}`
        };
      }

      if (section.includes('嵌入向量') || section.includes('面部指纹') || section.includes('数值化')) {
        return {
          type: 'fingerprint',
          content: section,
          key: `section-${index}`
        };
      }

      if (section.includes('光照') || section.includes('质量') || section.includes('拍摄') || section.includes('评价')) {
        return {
          type: 'quality',
          content: section,
          key: `section-${index}`
        };
      }

      return {
        type: 'general',
        content: section,
        key: `section-${index}`
      };
    });
  };

  const sections = parseAnalysis(text);

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'features':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case 'fingerprint':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'quality':
        return (
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'numbered':
        return (
          <div className="w-5 h-5 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-xs font-bold">
            {sections.find(s => s.key === sections.find(s => s.type === 'numbered')?.key)?.number || '1'}
          </div>
        );
      default:
        return (
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getSectionTitle = (type: string) => {
    switch (type) {
      case 'features':
        return '🔍 面部特征检测';
      case 'fingerprint':
        return '🧬 生物特征编码';
      case 'quality':
        return '⚡ 图像质量评估';
      default:
        return '📋 分析结果';
    }
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.key}
          className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            {getSectionIcon(section.type)}
            <div className="flex-1">
              {section.type !== 'general' && section.type !== 'numbered' && (
                <h4 className="font-semibold text-slate-800 mb-2 text-sm">
                  {getSectionTitle(section.type)}
                </h4>
              )}
              <p className="text-sm text-slate-700 leading-relaxed">
                {section.content}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* AI分析提示 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-cyan-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-cyan-800 mb-1 text-sm">AI分析说明</h4>
            <p className="text-xs text-cyan-700 leading-relaxed">
              以上分析由Google Gemini AI模型生成，基于先进的计算机视觉算法识别面部特征点，
              并通过深度学习技术转换为数字特征向量，用于人脸识别和验证。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<LabStep>(LabStep.INTRO);
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [labRecords, setLabRecords] = useState<LabRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [unlockStatus, setUnlockStatus] = useState<{
    match: boolean;
    similarity: number;
    explanation: string;
  } | null>(null);

  const addRecord = (step: LabStep, observation: string, result: string) => {
    setLabRecords((prev) => [
      ...prev.filter((r) => r.step !== step),
      { step, observation, result },
    ]);
  };

  const handleRecognizeUpload = async (base64: string) => {
    setIsProcessing(true);
    setAnalysisText(null);
    try {
      const insight = await analyzeFace(base64);
      setAnalysisText(insight);
      addRecord(
        LabStep.RECOGNIZE,
        "通过上传人脸图像观察机器的感知过程。",
        insight
      );
    } catch (err) {
      setAnalysisText("分析图像时出错。请重试。");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnrollment = async (base64: string) => {
    setIsProcessing(true);
    try {
      setEnrollment({
        name: "演示用户_01",
        faceImage: base64,
        timestamp: Date.now(),
      });
      addRecord(
        LabStep.REMEMBER,
        "上传基准图像并将面部特征向量存入模拟数据库。",
        "成功：已在系统注册面部指纹。"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlockAttempt = async (base64: string) => {
    if (!enrollment) return;
    setIsProcessing(true);
    setUnlockStatus(null);
    try {
      const result = await compareFaces(enrollment.faceImage, base64);
      setUnlockStatus(result);
      addRecord(
        LabStep.UNLOCK,
        "上传新图像与注册图像进行生物特征比对。",
        result.match ? "验证通过：门锁已开启" : "验证失败：禁止通行"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case LabStep.INTRO:
        return (
          <div className="max-w-2xl mx-auto space-y-6 text-center py-10">
            <div className="bg-cyan-100 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
              <svg
                className="w-12 h-12 text-cyan-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
              人脸识别模拟实验室
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              欢迎来到人工智能探究平台。通过图像上传模拟，我们将学习机器是如何“分析”我们的，
              <br />
              并亲手实现一个虚拟的智能开锁系统。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="text-cyan-500 font-bold text-xl mb-1">
                  任务 1
                </div>
                <div className="text-sm font-medium">机器如何“看”？</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="text-cyan-500 font-bold text-xl mb-1">
                  任务 2
                </div>
                <div className="text-sm font-medium">机器如何“记”？</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="text-cyan-500 font-bold text-xl mb-1">
                  任务 3
                </div>
                <div className="text-sm font-medium">模拟刷脸实验</div>
              </div>
            </div>
            <button
              onClick={() => setCurrentStep(LabStep.RECOGNIZE)}
              className="mt-8 px-10 py-4 bg-cyan-600 text-white rounded-full font-bold shadow-xl hover:bg-cyan-500 transition-all active:scale-95"
            >
              开始探究任务
            </button>
          </div>
        );

      case LabStep.RECOGNIZE:
        return (
          <div className="max-w-4xl mx-auto space-y-8 py-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                探究：机器是如何“认识”我们的？
              </h2>
              <p className="text-slate-600 mb-6 italic">
                请上传一张清晰的人脸照片。AI
                将展示它是如何定位特征点并理解面部结构的。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <ImageUploader
                  onUpload={handleRecognizeUpload}
                  label="上传图片进行识别"
                  isProcessing={isProcessing}
                />
                <div className="bg-slate-50 p-6 rounded-xl min-h-[300px] border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-3 border-b pb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-cyan-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    机器视觉分析报告
                  </h3>
                  {analysisText ? (
                    <AnalysisReport text={analysisText} />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center justify-center h-48 gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-center">请上传人脸图片进行AI分析</p>
                      <p className="text-xs text-center text-slate-300">系统将自动识别面部特征并生成专业报告</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(LabStep.INTRO)}
                className="px-6 py-2 text-slate-500 font-medium hover:text-slate-700"
              >
                返回首页
              </button>
              <button
                onClick={() => setCurrentStep(LabStep.REMEMBER)}
                disabled={!analysisText}
                className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all ${
                  analysisText
                    ? "bg-cyan-600 hover:bg-cyan-500"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                下一步：录入数据库
              </button>
            </div>
          </div>
        );

      case LabStep.REMEMBER:
        return (
          <div className="max-w-4xl mx-auto space-y-8 py-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
              <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                <span className="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center text-sm">
                  2
                </span>
                探究：如何让机器“记住”人脸？
              </h2>
              <p className="text-slate-600 mb-6">
                机器需要将注册图片的特征码存入数据库。请上传你想要“注册”到系统的面部图片。
                {enrollment ? (
                  <span className="text-green-600 font-bold ml-2">
                    ✓ 注册成功
                  </span>
                ) : (
                  <span className="italic ml-2">请上传图片。</span>
                )}
              </p>

              <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                <div className="w-full max-w-sm">
                  <ImageUploader
                    onUpload={handleEnrollment}
                    label="点击上传注册图片"
                    isProcessing={isProcessing}
                  />
                </div>
                {enrollment && (
                  <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-100 w-full max-w-sm flex flex-col items-center">
                    <h3 className="font-bold text-cyan-800 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3 12v3c0 1.1.9 2 2 2h10a2 2 0 002-2v-3a2 2 0 00-2-2H5a2 2 0 00-2 2zm9-1a1 1 0 100-2 1 1 0 000 2zm-1-8a2 2 0 00-4 0v2h4V3z" />
                        <path
                          fillRule="evenodd"
                          d="M5 5V3a5 5 0 0110 0v2H5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      系统库记录
                    </h3>
                    <div className="w-40 h-40 rounded-lg border-2 border-cyan-300 overflow-hidden mb-4 shadow-sm">
                      <img
                        src={enrollment.faceImage}
                        alt="注册图"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs text-cyan-700 space-y-1 w-full text-left font-mono">
                      <p>
                        <strong>UID:</strong> USER_REG_99
                      </p>
                      <p>
                        <strong>STATUS:</strong> 已加密存储
                      </p>
                      <p>
                        <strong>TIME:</strong>{" "}
                        {new Date(enrollment.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(LabStep.RECOGNIZE)}
                className="px-6 py-2 text-slate-500 font-medium hover:text-slate-700"
              >
                上一步
              </button>
              <button
                onClick={() => setCurrentStep(LabStep.UNLOCK)}
                disabled={!enrollment}
                className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all ${
                  enrollment
                    ? "bg-cyan-600 hover:bg-cyan-500"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                下一步：模拟识别开锁
              </button>
            </div>
          </div>
        );

      case LabStep.UNLOCK:
        return (
          <div className="max-w-4xl mx-auto space-y-8 py-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center text-sm">
                  3
                </span>
                实验：模拟刷脸开锁功能
              </h2>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <p className="text-slate-600 mb-6 italic">
                    请上传一张图片，系统将将其与数据库中的注册图片进行 1:1
                    特征匹配。
                  </p>
                  <ImageUploader
                    onUpload={handleUnlockAttempt}
                    label="上传测试图片开锁"
                    isProcessing={isProcessing}
                  />
                </div>

                <div className="w-full md:w-80 flex flex-col gap-4">
                  <div
                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center ${
                      !unlockStatus
                        ? "bg-slate-50 border-slate-100"
                        : unlockStatus.match
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                        !unlockStatus
                          ? "bg-slate-200 text-slate-400"
                          : unlockStatus.match
                          ? "bg-green-500 text-white shadow-lg shadow-green-200"
                          : "bg-red-500 text-white shadow-lg shadow-red-200"
                      }`}
                    >
                      {unlockStatus?.match ? (
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      )}
                    </div>
                    <h3 className="font-black text-xl mb-1">
                      {!unlockStatus
                        ? "等待上传"
                        : unlockStatus.match
                        ? "解锁成功"
                        : "匹配失败"}
                    </h3>
                    {unlockStatus && (
                      <div className="mt-2">
                        <div className="text-sm font-bold text-slate-600">
                          相似度分数: {unlockStatus.similarity.toFixed(1)}%
                        </div>
                        <p className="text-xs text-slate-500 mt-2 italic px-2 leading-relaxed">
                          {unlockStatus.explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[10px] leading-tight overflow-hidden shadow-xl">
                    <div className="flex justify-between border-b border-slate-700 pb-1 mb-2 text-cyan-400">
                      <span>BIOMETRIC_ENGINE</span>
                      <span>v3.1.2</span>
                    </div>
                    <p className="text-green-500">[INIT] 验证算法就绪</p>
                    <p>[STATE] 等待比对样本...</p>
                    {unlockStatus && (
                      <>
                        <p className="text-yellow-400">[SAMPLE] 样本已接收</p>
                        <p className="text-blue-400">
                          [PROC] 提取特征向量 [32, 128, ...]
                        </p>
                        <p
                          className={
                            unlockStatus.match
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {unlockStatus.match
                            ? "[RESULT] 身份确认，执行解锁指令"
                            : "[RESULT] 相似度过低，拒绝访问"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(LabStep.REMEMBER)}
                className="px-6 py-2 text-slate-500 font-medium hover:text-slate-700"
              >
                修改注册图
              </button>
              <button
                onClick={() => setCurrentStep(LabStep.REPORT)}
                className="px-8 py-3 bg-slate-800 text-white rounded-full font-bold shadow-lg hover:bg-slate-700 transition-all"
              >
                生成结课报告
              </button>
            </div>
          </div>
        );

      case LabStep.REPORT:
        return (
          <div className="max-w-5xl mx-auto space-y-8 py-6">
            <div
              id="report-container"
              className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200 flex flex-col md:flex-row min-h-[800px] report-printable"
            >
              {/* Sidebar / Aesthetic strip */}
              <div className="w-full md:w-16 bg-slate-900 flex md:flex-col items-center justify-between p-4 md:py-8 text-cyan-400 shrink-0 sidebar-printable">
                <div className="flex md:flex-col items-center gap-6">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeWidth={2}
                    />
                  </svg>
                  <div className="h-px w-8 md:w-px md:h-12 bg-slate-700"></div>
                  <div className="md:-rotate-90 md:whitespace-nowrap font-mono text-[10px] tracking-widest opacity-50">
                    BIOMETRIC_ID_SIM_001
                  </div>
                </div>
                <div className="text-[10px] font-mono opacity-30 hidden md:block">
                  VER: 3.1
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-grow p-8 md:p-12 space-y-10 relative content-printable">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full -mr-32 -mt-32 opacity-50 z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-50 rounded-full -ml-24 -mb-24 opacity-50 z-0"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-100 pb-8 gap-6">
                  <div>
                    <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                      AI 探究结课报告
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 leading-tight">
                      人脸识别技术探究与模拟实践
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      人工智能实验室 • 2024 年度课程项目报告
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-right min-w-[160px]">
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                      生成时间
                    </div>
                    <div className="text-slate-800 font-mono font-bold text-lg">
                      {new Date().toLocaleDateString()}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                        完成状态
                      </div>
                      <div className="text-green-600 font-bold text-xs flex items-center justify-end gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        100% 已提交
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Left Column: Data & Stats */}
                  <div className="lg:col-span-8 space-y-10">
                    <section>
                      <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-4 h-1 bg-cyan-500"></div>{" "}
                        实验背景与目标
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                          <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 4v16m8-8H4" strokeWidth={2} />
                            </svg>
                          </div>
                          <div>
                            <div className="text-slate-900 font-bold text-sm">
                              技术认知
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              理解面部特征定位、编码与匹配的逻辑。
                            </p>
                          </div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                strokeWidth={2}
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-slate-900 font-bold text-sm">
                              生活实践
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              探究刷脸技术在智能物联中的应用。
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-4 h-1 bg-cyan-500"></div>{" "}
                        实验流水线记录
                      </h2>
                      <div className="space-y-4">
                        {labRecords.map((record, idx) => (
                          <div
                            key={idx}
                            className="group flex items-start gap-4"
                          >
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-4 ring-slate-100">
                                0{idx + 1}
                              </div>
                              {idx < labRecords.length - 1 && (
                                <div className="w-0.5 h-full bg-slate-100 my-1"></div>
                              )}
                            </div>
                            <div className="flex-grow bg-slate-50 p-5 rounded-2xl group-hover:bg-cyan-50/30 transition-colors border border-transparent group-hover:border-cyan-100">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                                  {record.step === LabStep.RECOGNIZE
                                    ? "人脸特征感知"
                                    : record.step === LabStep.REMEMBER
                                    ? "特征库注册"
                                    : record.step === LabStep.UNLOCK
                                    ? "生物特征验证"
                                    : record.step}
                                </h3>
                                <span className="text-[10px] font-mono text-slate-400">
                                  LOG_OK
                                </span>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                    执行操作
                                  </div>
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    {record.observation}
                                  </p>
                                </div>
                                <div className="bg-white/60 p-3 rounded-lg border border-slate-200/50">
                                  <div className="text-[10px] font-bold text-cyan-600 uppercase mb-1">
                                    机器产出结果
                                  </div>
                                  <p className="text-xs text-slate-600 italic leading-relaxed">
                                    {record.result}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Visual Summary */}
                  <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group stats-card-printable">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400 blur-3xl opacity-20 -mr-12 -mt-12 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative z-10 flex items-center justify-between mb-8">
                        <div className="text-xs font-black uppercase tracking-widest text-cyan-400">
                          验证汇总
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 2.32a1 1 0 01-.196 1.414l-1.583 1.187 1.187 1.583a1 1 0 01-1.414 1.583l-1.187-1.583-1.583 1.187a1 1 0 01-1.583-1.187l1.187-1.583-1.583-1.187a1 1 0 01-.196-1.414l1.738-2.32-1.233-.616a1 1 0 01.894-1.79l1.599.8L11 4.323V3a1 1 0 01-1-1z" />
                          </svg>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-end justify-between">
                          <div className="text-3xl font-black">
                            {unlockStatus
                              ? unlockStatus.similarity.toFixed(0)
                              : "--"}
                            <span className="text-sm font-normal text-slate-400 ml-1">
                              %
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            SIM_SPECTRUM
                          </div>
                        </div>

                        {/* 升级版柱状图可视化 (Simple Bar Chart Visualization) */}
                        <div className="flex items-end gap-1 h-14 w-full pt-2">
                          {Array.from({ length: 15 }).map((_, i) => {
                            const step = 100 / 15;
                            const threshold = i * step;
                            const isActive =
                              (unlockStatus?.similarity || 0) >= threshold;
                            // 动态高度算法：中间高，两边略低，形成一种能量波动感
                            const baseHeight = 24;
                            const variance = Math.max(
                              0,
                              10 - Math.abs(7 - i) * 1.5
                            );
                            const h = isActive ? baseHeight + variance : 4;
                            return (
                              <div
                                key={i}
                                className={`flex-1 rounded-t-sm transition-all duration-700 ease-out`}
                                style={{
                                  height: `${h}px`,
                                  backgroundColor: isActive
                                    ? unlockStatus?.match
                                      ? "#22d3ee"
                                      : "#f87171"
                                    : "rgba(255,255,255,0.1)",
                                }}
                              />
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <div className="text-[10px] text-slate-500 font-bold mb-1">
                              匹配状态
                            </div>
                            <div
                              className={`text-xs font-black uppercase ${
                                unlockStatus?.match
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {unlockStatus
                                ? unlockStatus.match
                                  ? "Passed"
                                  : "Denied"
                                : "None"}
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <div className="text-[10px] text-slate-500 font-bold mb-1">
                              置信阈值
                            </div>
                            <div className="text-xs font-black uppercase text-slate-300">
                              85% Fix
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-cyan-50 rounded-3xl border border-cyan-100 relative reflection-card-printable">
                      <h3 className="text-sm font-black text-cyan-800 mb-4 flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" />
                        </svg>
                        总结与反思
                      </h3>
                      <p className="text-xs text-cyan-700 leading-relaxed italic">
                        "通过本次探究，我学习到：人脸识别的核心不在于单纯的'对比图像'，而是在于'高维向量匹配'。机器通过卷积神经网络提取面部几何关系、纹理特征，将其映射到多维空间中计算余弦相似度。这不仅展示了
                        AI
                        处理海量非结构化数据的能力，也启发了我在智能物联时代对个人生物信息安全的思考。"
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-200 flex items-center justify-center text-[10px] font-bold text-cyan-700">
                          学
                        </div>
                        <span className="text-[10px] text-cyan-600 font-bold">
                          探究者签名：_________________
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center badge-printable">
                      <div className="border-4 border-slate-100 rounded-2xl p-4 rotate-3 opacity-50 select-none">
                        <div className="border-2 border-slate-200 rounded-lg px-4 py-2 text-slate-300 text-lg font-black uppercase tracking-widest text-center">
                          AI LAB
                          <br />
                          <span className="text-[10px]">CERTIFIED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12 print:hidden pb-10">
              <button
                onClick={() => {
                  setEnrollment(null);
                  setLabRecords([]);
                  setUnlockStatus(null);
                  setCurrentStep(LabStep.INTRO);
                }}
                className="px-10 py-4 bg-white text-slate-700 rounded-full font-black border-2 border-slate-100 shadow-xl hover:bg-slate-50 transition-all transform hover:-translate-y-1"
              >
                重新开始实验
              </button>
            </div>

            <style>{`
              @media print {
                @page {
                  size: A4;
                  margin: 0;
                }
                html, body {
                  height: auto !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  overflow: visible !important;
                  background-color: white !important;
                }
                #root {
                  height: auto !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
                nav, footer, .print\\:hidden { 
                  display: none !important; 
                }
                main {
                  padding: 0 !important;
                  margin: 0 !important;
                  max-width: none !important;
                  width: 100% !important;
                }
                .report-printable {
                  box-shadow: none !important; 
                  border: none !important; 
                  min-height: auto !important;
                  margin: 0 !important;
                  border-radius: 0 !important;
                  width: 100% !important;
                  display: flex !important;
                  flex-direction: row !important;
                }
                .sidebar-printable {
                  width: 64px !important;
                  background-color: #0f172a !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .content-printable {
                  padding: 40px !important;
                  flex: 1 !important;
                  background-color: white !important;
                }
                .stats-card-printable {
                  background-color: #0f172a !important;
                  color: white !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                  padding: 24px !important;
                }
                .reflection-card-printable {
                  background-color: #ecfeff !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                  padding: 24px !important;
                }
                .bg-cyan-50 { background-color: #ecfeff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .bg-cyan-100 { background-color: #cffafe !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .bg-slate-50 { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .text-cyan-400 { color: #22d3ee !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .text-cyan-700 { color: #0e7490 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                
                /* Ensure all elements are visible on one page or break nicely */
                h1, h2, h3, p, section {
                  break-inside: avoid;
                }
              }
            `}</style>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      {/* 顶部进度导航 */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl text-slate-800">
            <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center text-white shadow-inner">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeWidth={2.5}
                />
              </svg>
            </div>
            <span>FACE ID 模拟器</span>
          </div>
          {/* 简化的步骤进度指示器 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 hidden sm:block">
              步骤 {Object.values(LabStep).indexOf(currentStep) + 1} / 5
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => {
                const stepIndex = i;
                const currentIndex = Object.values(LabStep).indexOf(currentStep);
                const isCompleted = stepIndex < currentIndex;
                const isCurrent = stepIndex === currentIndex;

                return (
                  <div
                    key={i}
                    onClick={() => setCurrentStep(Object.values(LabStep)[i])}
                    className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                      isCompleted
                        ? "bg-cyan-600"
                        : isCurrent
                        ? "bg-cyan-400 animate-pulse"
                        : "bg-slate-300"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* 完整步骤条 - 浮动设计 */}
      <div className="relative print:hidden">
        <div className="absolute inset-x-4 top-0 bottom-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg px-6 py-4 w-full max-w-4xl mx-auto pointer-events-auto">
          <div className="flex items-center justify-center gap-6 md:gap-10">
            {[
              { key: LabStep.INTRO, name: "实验介绍", desc: "了解人脸识别原理" },
              { key: LabStep.RECOGNIZE, name: "人脸识别", desc: "观察AI如何识别面部" },
              { key: LabStep.REMEMBER, name: "人脸注册", desc: "注册面部信息" },
              { key: LabStep.UNLOCK, name: "身份验证", desc: "验证身份安全性" },
              { key: LabStep.REPORT, name: "实验报告", desc: "总结学习成果" },
            ].map((step, i) => {
              const stepIndex = Object.values(LabStep).indexOf(step.key);
              const currentIndex = Object.values(LabStep).indexOf(currentStep);
              const isCompleted = stepIndex < currentIndex;
              const isCurrent = stepIndex === currentIndex;

              return (
                <div key={step.key} className="flex flex-col items-center max-w-20 md:max-w-24">
                  {/* 步骤圆圈和连接线 */}
                  <div className="flex items-center w-full">
                    {/* 步骤圆圈 */}
                    <div
                      onClick={() => setCurrentStep(step.key)}
                      className={`relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-2 transition-all duration-500 cursor-pointer hover:shadow-lg hover:scale-105 flex-shrink-0 ${
                        isCompleted
                          ? "bg-cyan-600 border-cyan-600 text-white shadow-lg hover:bg-cyan-700"
                          : isCurrent
                          ? "bg-white border-cyan-500 text-cyan-600 shadow-lg animate-pulse"
                          : "bg-white border-slate-300 text-slate-400 hover:border-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-lg md:text-xl font-bold" role="img" aria-label={`步骤 ${i + 1}`}>
                          {['⓵', '⓶', '⓷', '⓸', '⓹'][i]}
                        </span>
                      )}
                    </div>

                    {/* 连接线 */}
                    {i < 4 && (
                      <div
                        className={`flex-1 h-1.5 mx-3 md:mx-4 rounded-full transition-all duration-700 ${
                          isCompleted ? "bg-cyan-600" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>

                  {/* 步骤信息 */}
                  <div className="mt-4 text-center">
                    <div
                      className={`text-sm md:text-base font-semibold transition-all duration-300 leading-tight ${
                        isCurrent
                          ? "text-cyan-600"
                          : isCompleted
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step.name}
                    </div>
                    <div className="text-xs md:text-sm text-slate-600 mt-1 leading-tight max-w-20 md:max-w-24">
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>

      {/* 当前步骤指示器 */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100 px-4 py-6 print:hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-cyan-600 text-white rounded-full text-sm font-semibold">
              {Object.values(LabStep).indexOf(currentStep) + 1}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800">
                {[
                  { key: LabStep.INTRO, name: "实验介绍", desc: "了解人脸识别原理" },
                  { key: LabStep.RECOGNIZE, name: "人脸识别", desc: "观察AI如何识别面部" },
                  { key: LabStep.REMEMBER, name: "人脸注册", desc: "注册面部信息" },
                  { key: LabStep.UNLOCK, name: "身份验证", desc: "验证身份安全性" },
                  { key: LabStep.REPORT, name: "实验报告", desc: "总结学习成果" },
                ].find(step => step.key === currentStep)?.name}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {[
                  { key: LabStep.INTRO, name: "实验介绍", desc: "了解人脸识别原理" },
                  { key: LabStep.RECOGNIZE, name: "人脸识别", desc: "观察AI如何识别面部" },
                  { key: LabStep.REMEMBER, name: "人脸注册", desc: "注册面部信息" },
                  { key: LabStep.UNLOCK, name: "身份验证", desc: "验证身份安全性" },
                  { key: LabStep.REPORT, name: "实验报告", desc: "总结学习成果" },
                ].find(step => step.key === currentStep)?.desc}
              </p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <div>步骤 {Object.values(LabStep).indexOf(currentStep) + 1} / 5</div>
              <div className="text-xs mt-1">
                {Math.round(((Object.values(LabStep).indexOf(currentStep) + 1) / 5) * 100)}% 完成
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 实验内容 */}
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>

      {/* 页脚 */}
      <footer className="py-6 border-t text-center text-slate-400 text-xs bg-white print:hidden">
        &copy; 2024 人工智能科普教育平台 - 让每一个学生都能通过实践理解 AI
      </footer>
    </div>
  );
};

export default App;
