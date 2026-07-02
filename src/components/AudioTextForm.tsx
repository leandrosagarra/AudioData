/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, Mic, AlertCircle, Sparkles } from "lucide-react";

interface AudioTextFormProps {
  onAnalyze: (payload: {
    type: "audio" | "text";
    content?: string;
    fileBase64?: string;
    mimeType?: string;
    filename?: string;
    title: string;
  }) => void;
  isLoading: boolean;
}

export default function AudioTextForm({ onAnalyze, isLoading }: AudioTextFormProps) {
  const [activeTab, setActiveTab] = useState<"audio" | "text">("audio");
  const [title, setTitle] = useState("");
  const [textInput, setTextInput] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isAudio = file.type.startsWith("audio/") || 
                      /\.(mp3|wav|m4a|ogg|wma|flac|aac|webm|mp4)$/i.test(file.name);
      if (isAudio) {
        setAudioFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, "")); // Set original file name as default title
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || (activeTab === "audio" ? "Análisis de Audio" : "Análisis de Texto");

    if (activeTab === "text") {
      if (!textInput.trim()) return;
      onAnalyze({
        type: "text",
        content: textInput,
        title: finalTitle,
      });
    } else {
      if (!audioFile) return;
      
      const reader = new FileReader();
      reader.readAsDataURL(audioFile);
      reader.onload = () => {
        const rawResult = reader.result as string;
        // Base64 encoding string after comma
        const base64String = rawResult.split(",")[1];
        
        // Determine a safe standard mimeType
        let resolvedMime = audioFile.type;
        if (!resolvedMime || resolvedMime === "application/octet-stream") {
          if (audioFile.name.toLowerCase().endsWith(".mp3")) {
            resolvedMime = "audio/mp3";
          } else if (audioFile.name.toLowerCase().endsWith(".wav")) {
            resolvedMime = "audio/wav";
          } else if (audioFile.name.toLowerCase().endsWith(".m4a")) {
            resolvedMime = "audio/m4a";
          } else {
            resolvedMime = "audio/mp3"; // Default fallback
          }
        }

        onAnalyze({
          type: "audio",
          fileBase64: base64String,
          mimeType: resolvedMime,
          filename: audioFile.name,
          title: finalTitle,
        });
      };
      reader.onerror = (err) => {
        console.error("Error al leer archivo de audio:", err);
      };
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden" id="analysis-form-card">
      {/* Header and Toggle Navigation */}
      <div className="flex border-b border-[#E2E8F0] bg-slate-50/50">
        <button
          id="btn-tab-audio"
          type="button"
          onClick={() => {
            setActiveTab("audio");
            setAudioFile(null);
          }}
          className={`flex-1 py-4 px-6 text-sm font-medium tracking-tight border-b-2 flex items-center justify-center gap-2 transition-all ${
            activeTab === "audio"
              ? "border-teal-600 text-teal-800 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Mic className="w-4 h-4" />
          Análisis de Audio
        </button>
        <button
          id="btn-tab-text"
          type="button"
          onClick={() => {
            setActiveTab("text");
            setTextInput("");
          }}
          className={`flex-1 py-4 px-6 text-sm font-medium tracking-tight border-b-2 flex items-center justify-center gap-2 transition-all ${
            activeTab === "text"
              ? "border-teal-600 text-teal-800 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          Pegar Transp./Texto
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Document Title Input */}
        <div className="space-y-2">
          <label htmlFor="doc-title" className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Título de la entrevista / Comentario
          </label>
          <input
            id="doc-title"
            type="text"
            required
            placeholder="Ej. Entrevista a Axel Kicillof en Radio con Vos / Comentarios..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-sans"
          />
        </div>

        {/* Tab Panel: Audio Upload */}
        {activeTab === "audio" && (
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Archivo de Audio
            </label>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-teal-600 bg-teal-50/30"
                  : audioFile
                  ? "border-slate-300 bg-slate-50/50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="audio/*,audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/m4a,audio/x-m4a,audio/ogg,audio/aac,audio/flac,.mp3,.wav,.m4a,.ogg,.aac,.flac"
                onChange={handleFileChange}
              />

              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>

              {audioFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-800 break-all">{audioFile.name}</p>
                  <p className="text-xs text-slate-500/80">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Audio compatible listo
                  </p>
                  <p className="text-xs text-teal-600 font-medium mt-2">Haga clic o arrastre para reemplazar</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700">Arraste y suelte su archivo de audio aquí</p>
                  <p className="text-xs text-slate-400">formatos MP3, WAV, M4A u otros formatos de voz</p>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 border border-teal-200 bg-teal-50/40 px-3 py-1.5 rounded-md hover:bg-teal-50 transition-colors"
                  >
                    Seleccionar Archivo
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100/80 text-xs text-slate-500">
              <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <p>
                El modelo transcribirá automáticamente el audio en español antes de proceder con el riguroso análisis político de actores santafesinos, nacionales y agrupaciones.
              </p>
            </div>
          </div>
        )}

        {/* Tab Panel: Text Area */}
        {activeTab === "text" && (
          <div className="space-y-2">
            <label htmlFor="text-content" className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Texto de la entrevista o declaración transcrita
            </label>
            <textarea
              id="text-content"
              required
              rows={8}
              placeholder="Pegue aquí el texto de la transcripción, reporte periodístico, comentarios de prensa o entrevista que desea auditar..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-sans leading-relaxed resize-y"
            />
          </div>
        )}

        {/* Action Button */}
        <button
          id="btn-submit-analyze"
          type="submit"
          disabled={isLoading || (activeTab === "audio" && !audioFile) || (activeTab === "text" && !textInput.trim())}
          className={`w-full py-3.5 px-6 rounded-lg font-medium text-sm tracking-tight flex items-center justify-center gap-2 shadow-sm transition-all ${
            isLoading || (activeTab === "audio" && !audioFile) || (activeTab === "text" && !textInput.trim())
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.98] cursor-pointer"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? "Procesando material periodístico..." : "Comenzar Auditoría de IA"}
        </button>
      </form>
    </div>
  );
}
