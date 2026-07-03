/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import AudioTextForm from "./components/AudioTextForm";
import HistorySidebar from "./components/HistorySidebar";
import DynamicReport from "./components/DynamicReport";
import { JournalHistoryItem, AnalysisResult } from "./types";
import { Newspaper, HelpCircle, FileText, RefreshCw, AlertCircle, Sparkles, Check } from "lucide-react";

export default function App() {
  const [history, setHistory] = useState<JournalHistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<JournalHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state with local storage on startup
  useEffect(() => {
    try {
      const cached = localStorage.getItem("periodistic_audit_history");
      if (cached) {
        const parsed = JSON.parse(cached) as JournalHistoryItem[];
        setHistory(parsed);
        if (parsed.length > 0) {
          setSelectedItem(parsed[0]); // Auto-open the latest analysis on startup
        }
      }
    } catch (e) {
      console.error("No se pudo leer el historial de localStorage", e);
    }
  }, []);

  // Write history changes back to localStorage
  const saveHistory = (updatedHistory: JournalHistoryItem[]) => {
    setHistory(updatedHistory);
    try {
      localStorage.setItem("periodistic_audit_history", JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("No se pudo escribir el historial a localStorage", e);
    }
  };

  // Process manual or file analysis request via the Node backend /api/analyze endpoint
  const handleAnalyze = async (payload: {
    type: "audio" | "text" | "audio_url";
    content?: string;
    fileBase64?: string;
    mimeType?: string;
    filename?: string;
    title: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: payload.type,
          content: payload.content,
          fileBase64: payload.fileBase64,
          mimeType: payload.mimeType,
          filename: payload.filename,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error del servidor al procesar el análisis (Código: ${response.status})`);
      }

      const result = (await response.json()) as AnalysisResult;

      // Construct a new record for the local journal archive
      const sizeStr = payload.fileBase64 
        ? `${(payload.fileBase64.length * 0.75 / (1024 * 1024)).toFixed(2)} MB` 
        : undefined;

      const newItem: JournalHistoryItem = {
        id: crypto.randomUUID(),
        title: payload.title,
        type: payload.type,
        fileName: payload.filename,
        fileSize: sizeStr,
        pastedTextSnippet: payload.content ? payload.content.slice(0, 80) + "..." : undefined,
        timestamp: new Date().toISOString(),
        result: result,
      };

      const updatedHistory = [newItem, ...history];
      saveHistory(updatedHistory);
      setSelectedItem(newItem);

    } catch (err: any) {
      console.error("Auditing execution error:", err);
      setErrorMessage(err.message || "Excepción inesperada al comunicarse con el motor periodístico de IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((x) => x.id !== id);
    saveHistory(updated);
    if (selectedItem?.id === id) {
      setSelectedItem(updated.length > 0 ? updated[0] : null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased font-sans flex flex-col">
      
      {/* Editorial Header bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white shadow-md py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white font-serif font-black text-xl tracking-tight shadow-md">
            P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-widest text-teal-400 font-bold bg-teal-900/40 px-2 py-0.5 rounded border border-teal-800/10">Senior Political Analyst</span>
              <span className="text-[9px] uppercase tracking-widest text-[#94A3B8] font-bold bg-[#1E293B] px-2 py-0.5 rounded border border-slate-700/30">Nacional & PBA</span>
            </div>
            <h1 className="text-md md:text-lg font-extrabold tracking-tight font-sans text-slate-100 mt-0.5">
              ANALIZADOR PERIODÍSTICO DE ENTREVISTAS
            </h1>
          </div>
        </div>

        {/* Global credit panel */}
        <div className="hidden lg:flex items-center gap-2">
          <Newspaper className="w-4.5 h-4.5 text-teal-400" />
          <span className="text-xs text-slate-300 font-medium">Auditoría Objetiva de Relatos y Textuales Entrevistados</span>
        </div>
      </header>

      {/* Editor Context / Instruction Banner */}
      <section className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 text-white px-6 py-8 md:px-12 border-b border-teal-900/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-lg md:text-xl font-bold font-serif tracking-tight text-teal-300">
              Protocolo Editorial de Descomposición Analítica Político-Ideológica
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
              Sistema de asistencia para periodistas seniors. Suba un archivo de voz o pegue declaraciones de prensa para transcribir literalmente e identificar comentarios, alineaciones políticas o críticas respecto al gobernador de Buenos Aires <strong className="text-slate-100 font-semibold">Axel Kicillof</strong>, el <strong className="text-slate-100 font-semibold">Peronismo</strong>, la ex presidenta <strong className="text-slate-100 font-semibold">Cristina Fernández de Kirchner</strong>, la organización <strong className="text-slate-100 font-semibold">La Cámpora</strong> y su líder <strong className="text-slate-100 font-semibold">Máximo Kirchner</strong>.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-teal-900/20 border border-teal-500/15 p-4 rounded-xl text-xs text-slate-300 max-w-sm">
            <Sparkles className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
            <p>
              El motor de IA extrae citas textuales <strong className="text-teal-300 font-medium">completamente literales</strong> para resguardar la neutralidad absoluta y evitar desvíos subjetivos de interpretación.
            </p>
          </div>
        </div>
      </section>

      {/* Main App Grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Inputs and History */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Analysis Trigger Form */}
          <AudioTextForm onAnalyze={handleAnalyze} isLoading={isLoading} />

          {/* History / Saved reports index */}
          <HistorySidebar
            items={history}
            selectedId={selectedItem?.id || null}
            onSelect={(item) => {
              setSelectedItem(item);
              setErrorMessage(null);
            }}
            onDelete={handleDeleteHistoryItem}
          />

        </div>

        {/* Right Side: Dynamic Interactive Report */}
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-6 min-h-[500px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-700 animate-spin flex items-center justify-center"></div>
                <Newspaper className="w-6 h-6 text-teal-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase">
                  Procesando fuentes periodísticas...
                </h3>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  Buscando referencias políticas, transcribiendo los diálogos del audio literalmente paso-a-paso, y clasificando comentarios sobre Kicillof, Peronismo, CFK, La Cámpora y Máximo. Esto puede tardar unos segundos.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 max-w-sm">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
                  MÚLTIPLES CAPAS DE ANÁLISIS EN CURSO
                </span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Se está validando la cohesión léxica de las citas exactas de manera neutral.
                </p>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-red-900 uppercase">
                  Fallo en la comunicación periodística
                </h3>
                <p className="text-xs text-red-700">
                  {errorMessage}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Asegúrese de haber cargado una clave de API válida y de que el de formato de audio enviado sea correcto.
              </p>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="inline-flex items-center gap-1 bg-white border border-red-200 hover:bg-slate-50 text-xs text-red-700 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
              >
                Volver a intentar
              </button>
            </div>
          ) : selectedItem ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
              <DynamicReport
                title={selectedItem.title}
                timestamp={selectedItem.timestamp}
                type={selectedItem.type}
                result={selectedItem.result}
              />
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-6 min-h-[500px]">
              <div className="w-14 h-14 rounded-full bg-slate-100/80 text-slate-400 flex items-center justify-center">
                <Newspaper className="w-6 h-6" />
              </div>

              <div className="space-y-2 max-w-sm">
                <h3 className="text-sm font-bold text-slate-700 tracking-tight uppercase">
                  Aún no has procesado ningún material
                </h3>
                <p className="text-xs text-slate-400/95 font-sans leading-relaxed">
                  Cargue un archivo de audio o pegue las transcripciones textuales usando el panel izquierdo para dar vida a la auditoría analítica.
                </p>
              </div>

              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl text-left max-w-md space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  ASPECTOS CLAVES ANALIZADOS AUTOMÁTICAMENTE
                </h4>
                <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4 font-sans">
                  <li>Comentarios y lecturas objetivas de <strong>Axel Kicillof</strong>.</li>
                  <li>Posicionamientos y alineación con el <strong>Peronismo</strong> Nacional.</li>
                  <li>Rol institucional y coyuntura de la ex presidenta <strong>Cristina Kirchner</strong>.</li>
                  <li>Citas textuales e influencias en torno a <strong>La Cámpora</strong> y <strong>Máximo Kirchner</strong>.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-center py-6 mt-12 text-xs">
        <p>© {new Date().getFullYear()} Analizador Político Senior. Todos los derechos reservados.</p>
        <p className="mt-1 text-[11px] text-slate-600">Herramienta confidencial de uso exclusivo para editorialismo periodístico nacional.</p>
      </footer>

    </div>
  );
}
