
import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  onUpload: (base64: string) => void;
  label: string;
  isProcessing?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, label, isProcessing }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div 
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="relative w-full max-w-md mx-auto aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 shadow-inner group flex flex-col items-center justify-center transition-all hover:border-cyan-400 hover:bg-slate-50"
    >
      {preview ? (
        <div className="absolute inset-0 w-full h-full">
          <img src={preview} alt="预览" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white text-slate-800 rounded-lg font-bold text-sm shadow-lg"
            >
              更换图片
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-600 font-medium">点击或拖拽图片到此处</p>
            <p className="text-slate-400 text-xs mt-1">支持 JPG, PNG 格式</p>
          </div>
          <button
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-2 px-6 py-2 rounded-full font-bold text-white transition-all transform hover:scale-105 ${
              isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 shadow-lg'
            }`}
          >
            {isProcessing ? '正在处理...' : label}
          </button>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {isProcessing && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-cyan-800 font-bold text-sm">AI 正在深度分析...</span>
          </div>
        </div>
      )}

      {/* 扫描动画层（仅在处理时显示） */}
      {isProcessing && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div className="w-full h-1 bg-cyan-400 absolute top-0 animate-[scan_2s_linear_infinite]" />
        </div>
      )}
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ImageUploader;
