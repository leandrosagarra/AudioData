/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { AnalysisResult } from "../types";
import {
  Mic,
  FileText,
  Copy,
  Check,
  Search,
  Download,
  Flame,
  User,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Coins,
  Building2,
  Globe
} from "lucide-react";

interface DynamicReportProps {
  title: string;
  timestamp: string;
  type: "audio" | "text" | "audio_url";
  result: AnalysisResult;
}

export default function DynamicReport({ title, timestamp, type, result }: DynamicReportProps) {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeEntityId, setActiveEntityId] = useState<
    "axel_kicillof" | "peronismo" | "cristina_kirchner" | "la_campora" | "maximo_kirchner"
  >("axel_kicillof");

  // Format creation date
  const dateStr = useMemo(() => {
    return new Date(timestamp).toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [timestamp]);

  // Copy structured report to clipboard in Markdown format
  const copyReportToClipboard = () => {
    try {
      let mdReport = `# AUDITORÍA DE ENTREVISTA: ${title}\n`;
      mdReport += `Fecha: ${dateStr}\n`;
      mdReport += `Tipo: ${type === "audio" ? "Audio Integrado" : type === "audio_url" ? "Audio por URL" : "Texto Pegado"}\n\n`;
      mdReport += `## RESUMEN GENERAL\n${result.summary}\n\n`;
      
      mdReport += `## PUNTOS CLAVE\n`;
      result.keyPoints.forEach((kp) => {
        mdReport += `- ${kp}\n`;
      });
      mdReport += `\n`;

      mdReport += `## CITAS GENERALES DESTACADAS\n`;
      result.relevantQuotes.forEach((q) => {
        mdReport += `> "${q.quote}"\n*Contexto: ${q.context}*\n\n`;
      });

      mdReport += `## AUDITORÍA POLÍTICA DETALLADA\n\n`;
      
      const entities: { id: string; label: string }[] = [
        { id: "axel_kicillof", label: "AXEL KICILLOF" },
        { id: "peronismo", label: "EL PERONISMO" },
        { id: "cristina_kirchner", label: "CRISTINA FERNÁNDEZ DE KIRCHNER" },
        { id: "la_campora", label: "LA CÁMPORA" },
        { id: "maximo_kirchner", label: "MÁXIMO KIRCHNER" }
      ];

      entities.forEach(({ id, label }) => {
        const data = result.politicalAnalysis[id as keyof typeof result.politicalAnalysis];
        if (data) {
          mdReport += `### ${label}\n`;
          mdReport += `**Síntesis de Menciones:** ${data.mentions}\n\n`;
          
          if (data.positives?.length > 0) {
            mdReport += `#### Comentarios Positivos:\n`;
            data.positives.forEach((p) => {
              mdReport += `- Cita: "${p.quote}"\n  Análisis: ${p.analysis}\n`;
            });
          } else {
            mdReport += `*No se registraron comentarios de carácter positivo.*\n`;
          }
          mdReport += `\n`;

          if (data.negatives?.length > 0) {
            mdReport += `#### Comentarios Negativos / Críticas:\n`;
            data.negatives.forEach((n) => {
              mdReport += `- Cita: "${n.quote}"\n  Análisis: ${n.analysis}\n`;
            });
          } else {
            mdReport += `*No se registraron comentarios de carácter crítico o negativo.*\n`;
          }
          mdReport += `\n---\n\n`;
        }
      });

      if (result.economicAnalysis) {
        mdReport += `## AUDITORÍA ECONÓMICA DE COYUNTURA\n\n`;
        
        mdReport += `### ECONOMÍA DE LA PROVINCIA DE BUENOS AIRES (PBA)\n`;
        mdReport += `**Diagnóstico:** ${result.economicAnalysis.pbaEconomy?.summary || 'No se registraron comentarios.'}\n\n`;
        if (result.economicAnalysis.pbaEconomy?.quotes?.length > 0) {
          mdReport += `**Citas provinciales:**\n`;
          result.economicAnalysis.pbaEconomy.quotes.forEach((q) => {
            mdReport += `- "${q.quote}"\n  *Análisis:* ${q.analysis}\n`;
          });
        }
        mdReport += `\n`;

        mdReport += `### ECONOMÍA DE LA REPÚBLICA ARGENTINA (NACIONAL)\n`;
        mdReport += `**Diagnóstico:** ${result.economicAnalysis.nationalEconomy?.summary || 'No se registraron comentarios.'}\n\n`;
        if (result.economicAnalysis.nationalEconomy?.quotes?.length > 0) {
          mdReport += `**Citas nacionales:**\n`;
          result.economicAnalysis.nationalEconomy.quotes.forEach((q) => {
            mdReport += `- "${q.quote}"\n  *Análisis:* ${q.analysis}\n`;
          });
        }
        mdReport += `\n---\n\n`;
      }

      mdReport += `## TRANSCRIPCIÓN LITERAL\n${result.transcription}\n`;

      navigator.clipboard.writeText(mdReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar reporte:", err);
    }
  };

  // Export report as a downloadable Markdown (.md) file
  const downloadReportFile = () => {
    try {
      let mdReport = `# AUDITORÍA DE ENTREVISTA: ${title}\n`;
      mdReport += `Fecha: ${dateStr}\n`;
      mdReport += `Tipo: ${type === "audio" ? "Audio Integrado" : type === "audio_url" ? "Audio por URL" : "Texto Pegado"}\n\n`;
      mdReport += `## RESUMEN GENERAL\n${result.summary}\n\n`;
      
      mdReport += `## PUNTOS CLAVE\n`;
      result.keyPoints.forEach((kp) => {
        mdReport += `- ${kp}\n`;
      });
      mdReport += `\n`;

      if (result.economicAnalysis) {
        mdReport += `## AUDITORÍA ECONÓMICA DE COYUNTURA\n\n`;
        
        mdReport += `### ECONOMÍA DE LA PROVINCIA DE BUENOS AIRES (PBA)\n`;
        mdReport += `**Diagnóstico:** ${result.economicAnalysis.pbaEconomy?.summary || 'No se registraron comentarios.'}\n\n`;
        if (result.economicAnalysis.pbaEconomy?.quotes?.length > 0) {
          mdReport += `**Citas provinciales:**\n`;
          result.economicAnalysis.pbaEconomy.quotes.forEach((q) => {
            mdReport += `- "${q.quote}"\n  *Análisis:* ${q.analysis}\n`;
          });
        }
        mdReport += `\n`;

        mdReport += `### ECONOMÍA DE LA REPÚBLICA ARGENTINA (NACIONAL)\n`;
        mdReport += `**Diagnóstico:** ${result.economicAnalysis.nationalEconomy?.summary || 'No se registraron comentarios.'}\n\n`;
        if (result.economicAnalysis.nationalEconomy?.quotes?.length > 0) {
          mdReport += `**Citas nacionales:**\n`;
          result.economicAnalysis.nationalEconomy.quotes.forEach((q) => {
            mdReport += `- "${q.quote}"\n  *Análisis:* ${q.analysis}\n`;
          });
        }
        mdReport += `\n---\n\n`;
      }

      mdReport += `## TRANSCRIPCIÓN LITERAL\n${result.transcription}\n`;

      const blob = new Blob([mdReport], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `auditoria_periodistica_${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error al exportar archivo", err);
    }
  };

  // Export report as an unstyled Microsoft Word (.doc) document
  const downloadDocFile = () => {
    try {
      const entities: { id: string; label: string }[] = [
        { id: "axel_kicillof", label: "AXEL KICILLOF" },
        { id: "peronismo", label: "EL PERONISMO" },
        { id: "cristina_kirchner", label: "CRISTINA FERNÁNDEZ DE KIRCHNER" },
        { id: "la_campora", label: "LA CÁMPORA" },
        { id: "maximo_kirchner", label: "MÁXIMO KIRCHNER" }
      ];

      let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #000000; }
            h1 { font-size: 18pt; font-weight: bold; margin-bottom: 5pt; }
            h2 { font-size: 14pt; font-weight: bold; margin-top: 15pt; margin-bottom: 5pt; border-bottom: 1px solid #ddd; padding-bottom: 3pt; }
            h3 { font-size: 12pt; font-weight: bold; margin-top: 10pt; margin-bottom: 3pt; }
            blockquote { margin-left: 20pt; font-style: italic; color: #444; }
            p { margin-bottom: 8pt; }
            ul { margin-top: 0pt; margin-bottom: 8pt; }
            .meta { font-size: 9pt; color: #666; margin-bottom: 20pt; }
          </style>
        </head>
        <body>
          <h1>AUDITORÍA DE ENTREVISTA: ${title}</h1>
          <div class="meta">
            <p><strong>Fecha de consolidación:</strong> ${dateStr}</p>
            <p><strong>Tipo de material:</strong> ${type === "audio" ? "Audio Integrado" : type === "audio_url" ? "Audio por URL" : "Texto Pegado"}</p>
          </div>

          <h2>RESUMEN GENERAL</h2>
          <div>
            ${result.summary.split("\n\n").map(para => `<p>${para}</p>`).join("")}
          </div>

          <h2>PUNTOS CLAVE Y REFLEXIONES</h2>
          <ul>
            ${result.keyPoints.map(kp => `<li>${kp}</li>`).join("")}
          </ul>

          <h2>CITAS GENERALES DESTACADAS</h2>
          ${result.relevantQuotes.map(q => `
            <blockquote>"${q.quote}"</blockquote>
            <p><em>Contexto: ${q.context}</em></p>
          `).join("")}

          <h2>AUDITORÍA POLÍTICA DETALLADA</h2>
          ${entities.map(({ id, label }) => {
            const data = result.politicalAnalysis[id as keyof typeof result.politicalAnalysis];
            if (!data) return '';
            
            let entityHtml = `<h3>${label}</h3>`;
            entityHtml += `<p><strong>Síntesis de Menciones:</strong> ${data.mentions}</p>`;
            
            if (data.positives?.length > 0) {
              entityHtml += `<p><strong>Comentarios Positivos / Apoyos:</strong></p><ul>`;
              data.positives.forEach((p) => {
                entityHtml += `<li>Cita: "${p.quote}"<br/>Análisis: ${p.analysis}</li>`;
              });
              entityHtml += `</ul>`;
            } else {
              entityHtml += `<p><em>No se registraron comentarios de carácter positivo.</em></p>`;
            }

            if (data.negatives?.length > 0) {
              entityHtml += `<p><strong>Comentarios Negativos / Críticas / Tensiones:</strong></p><ul>`;
              data.negatives.forEach((n) => {
                entityHtml += `<li>Cita: "${n.quote}"<br/>Análisis: ${n.analysis}</li>`;
              });
              entityHtml += `</ul>`;
            } else {
              entityHtml += `<p><em>No se registraron comentarios de carácter crítico o negativo.</em></p>`;
            }

            return entityHtml;
          }).join("")}

          <h2>AUDITORÍA ECONÓMICA DE COYUNTURA</h2>
          ${result.economicAnalysis ? `
            <h3>Economía de la Provincia de Buenos Aires (PBA)</h3>
            <p><strong>Diagnóstico:</strong> ${result.economicAnalysis.pbaEconomy?.summary || 'No se registraron comentarios.'}</p>
            ${result.economicAnalysis.pbaEconomy?.quotes?.length > 0 ? `
              <p><strong>Citas provinciales destacadas:</strong></p>
              <ul>
                ${result.economicAnalysis.pbaEconomy.quotes.map(q => `<li>"${q.quote}"<br/><em>Análisis:</em> ${q.analysis}</li>`).join("")}
              </ul>
            ` : '<p><em>No se registraron citas específicas.</em></p>'}

            <h3>Economía de la República Argentina (Plano Nacional)</h3>
            <p><strong>Diagnóstico:</strong> ${result.economicAnalysis.nationalEconomy?.summary || 'No se registraron comentarios.'}</p>
            ${result.economicAnalysis.nationalEconomy?.quotes?.length > 0 ? `
              <p><strong>Citas nacionales destacadas:</strong></p>
              <ul>
                ${result.economicAnalysis.nationalEconomy.quotes.map(q => `<li>"${q.quote}"<br/><em>Análisis:</em> ${q.analysis}</li>`).join("")}
              </ul>
            ` : '<p><em>No se registraron citas específicas.</em></p>'}
          ` : '<p><em>No se registraron alusiones económicas en este material.</em></p>'}

          <h2>TRANSCRIPCIÓN LITERAL</h2>
          <div style="font-family: 'Courier New', monospace; font-size: 10pt; white-space: pre-wrap;">
            ${result.transcription}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff' + htmlContent], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `auditoria_${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error al exportar archivo .doc:", err);
    }
  };

  // Highlighting matching text in the transcription search
  const highlightSearchText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-100 text-slate-900 px-0.5 rounded font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Define political structures for navigation tabs
  const politicalEntities = [
    { id: "axel_kicillof", label: "Axel Kicillof", category: "Gobernador PBA", icon: User, color: "text-amber-700 bg-amber-50 border-amber-200" },
    { id: "peronismo", label: "Peronismo", category: "Movimiento", icon: Users, color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
    { id: "cristina_kirchner", label: "Cristina Kirchner", category: "Ex Presidenta", icon: Award, color: "text-purple-700 bg-purple-50 border-purple-200" },
    { id: "la_campora", label: "La Cámpora", category: "Agrupación", icon: Flame, color: "text-orange-700 bg-orange-50 border-orange-200" },
    { id: "maximo_kirchner", label: "Máximo Kirchner", category: "Líder Cámpora", icon: User, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  ] as const;

  const currentEntityData = result.politicalAnalysis[activeEntityId];

  // Calculate some simple counts for the political entities
  const counts = useMemo(() => {
    const data: Record<string, { positives: number; negatives: number }> = {};
    Object.keys(result.politicalAnalysis).forEach((key) => {
      const entity = result.politicalAnalysis[key as keyof typeof result.politicalAnalysis];
      data[key] = {
        positives: entity?.positives?.length || 0,
        negatives: entity?.negatives?.length || 0,
      };
    });
    return data;
  }, [result.politicalAnalysis]);

  return (
    <div className="space-y-8 animate-fade-in" id="report-view">
      
      {/* Editorial Header */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {type === "audio" || type === "audio_url" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-100">
                  <Mic className="w-3 h-3" />
                  {type === "audio_url" ? "Audio por URL" : "Evidencia de Audio"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">
                  <FileText className="w-3 h-3" />
                  Archivo Documental
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">Analizado por Periodista Senior AI</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800 font-sans leading-tight">
              {title}
            </h1>

            <p className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
              Auditoría consolidada el {dateStr}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-copy-clipboard"
              type="button"
              onClick={copyReportToClipboard}
              className="inline-flex items-center gap-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 active:scale-[0.98] text-slate-700 px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
              {copied ? "¡Copiado!" : "Copiar en Markdown"}
            </button>

            <button
              id="btn-download-md"
              type="button"
              onClick={downloadReportFile}
              className="inline-flex items-center gap-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 active:scale-[0.98] text-slate-700 px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Reporte (.md)
            </button>

            <button
              id="btn-download-word-doc"
              type="button"
              onClick={downloadDocFile}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-350" />
              Descargar Word (.doc)
            </button>
          </div>
        </div>
      </div>

      {/* Overview & Key takeaway Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Editorial Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              SÍNTESIS EDITORIAL DE COYUNTURA
            </h2>
            <div className="text-sm text-slate-600 leading-relaxed font-sans space-y-3">
              {result.summary.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Highlights List / Key Points */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-slate-400" />
            DIRECTRICES Y CLAVES POLÍTICAS
          </h2>
          
          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1">
            {result.keyPoints.map((point, index) => (
              <div key={index} className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-[10px] font-mono leading-none flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Consolidated Highlights Quotes Slider / Display */}
      {result.relevantQuotes && result.relevantQuotes.length > 0 && (
        <div className="bg-teal-900/5 border border-teal-800/10 rounded-xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-teal-800 mb-4 flex items-center gap-2">
            <Award className="w-4.5 h-4.5" />
            TEXTUALES DESTACADOS (CONEXIÓN GENERAL)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.relevantQuotes.slice(0, 4).map((q, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-teal-900/10 space-y-2 hover:shadow-xs transition-shadow">
                <blockquote className="text-xs font-serif italic text-slate-700 leading-relaxed font-medium">
                  "{q.quote}"
                </blockquote>
                <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-teal-600" />
                  Contexto: {q.context}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Economics Spotlight Section */}
      <div className="space-y-4 border-t border-[#E2E8F0] pt-6">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-teal-600" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              AUDITORÍA Y COYUNTURA ECONÓMICA
            </h2>
            <p className="text-xs text-slate-450 font-sans mt-0.5">
              Diagnóstico estructurado de cuestiones financieras y fiscales tanto a nivel federal como provincial bonaerense.
            </p>
          </div>
        </div>

        {result.economicAnalysis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PBA Economy Card */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <div className="w-8 h-8 rounded bg-teal-100 flex items-center justify-center text-teal-700">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono tracking-wide text-slate-700 uppercase">
                      Provincia de Buenos Aires
                    </h3>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Impacto financiero, presupuestos y recursos provinciales
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed font-sans space-y-2">
                  <span className="text-[9px] uppercase font-bold text-teal-700 tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    DIAGNÓSTICO EDITORIAL
                  </span>
                  <p className="font-medium text-slate-700">
                    {result.economicAnalysis.pbaEconomy?.summary || "No se registraron comentarios directos en este material."}
                  </p>
                </div>

                {result.economicAnalysis.pbaEconomy?.quotes && result.economicAnalysis.pbaEconomy.quotes.length > 0 && (
                  <div className="space-y-3.5 pt-2">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                      CITAS REGISTRADAS ORIGINALES
                    </span>
                    <div className="space-y-3">
                      {result.economicAnalysis.pbaEconomy.quotes.map((q, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1.5 shadow-2xs">
                          <blockquote className="text-xs italic text-slate-800 font-serif border-l-2 border-teal-500 pl-2">
                            "{q.quote}"
                          </blockquote>
                          <p className="text-[10px] text-slate-500 font-sans pl-2 leading-relaxed">
                            <strong className="text-slate-600 font-semibold font-mono text-[9px] uppercase tracking-wide block mb-0.5">Análisis Periodístico:</strong>
                            {q.analysis}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* National Economy Card */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-700">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono tracking-wide text-slate-700 uppercase">
                      República Argentina (Plano Nacional)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Impacto nacional, inflación, tipo de cambio e industria
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed font-sans space-y-2">
                  <span className="text-[9px] uppercase font-bold text-blue-700 tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    DIAGNÓSTICO EDITORIAL
                  </span>
                  <p className="font-medium text-slate-700">
                    {result.economicAnalysis.nationalEconomy?.summary || "No se registraron comentarios directos en este material."}
                  </p>
                </div>

                {result.economicAnalysis.nationalEconomy?.quotes && result.economicAnalysis.nationalEconomy.quotes.length > 0 && (
                  <div className="space-y-3.5 pt-2">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                      CITAS REGISTRADAS ORIGINALES
                    </span>
                    <div className="space-y-3">
                      {result.economicAnalysis.nationalEconomy.quotes.map((q, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1.5 shadow-2xs">
                          <blockquote className="text-xs italic text-slate-800 font-serif border-l-2 border-blue-500 pl-2">
                            "{q.quote}"
                          </blockquote>
                          <p className="text-[10px] text-slate-500 font-sans pl-2 leading-relaxed">
                            <strong className="text-slate-600 font-semibold font-mono text-[9px] uppercase tracking-wide block mb-0.5">Análisis Periodístico:</strong>
                            {q.analysis}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-155 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400 italic font-sans">
              Este reporte fue generado con un protocolo anterior sin análisis económico avanzado. Realice la auditoría nuevamente para incorporar diagnósticos de la Provincia de Buenos Aires y de la Nación.
            </p>
          </div>
        )}
      </div>

      {/* Interactive Politic Analysis Grid Section */}
      <div className="space-y-4">
        <div className="border-b border-[#E2E8F0] pb-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            AUDITORÍA POLÍTICA INTEGRAL DE COYUNTURA
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Mapeo analítico riguroso con categorización de literalidad neutral sobre el gobernador y los referentes del peronismo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Menu Column - Actor selection */}
          <div className="lg:col-span-4 space-y-2">
            {politicalEntities.map((entity) => {
              const active = activeEntityId === entity.id;
              const entityCounts = counts[entity.id] || { positives: 0, negatives: 0 };
              const Icon = entity.icon;

              return (
                <button
                  key={entity.id}
                  id={`btn-entity-${entity.id}`}
                  onClick={() => setActiveEntityId(entity.id)}
                  type="button"
                  className={`w-full p-3.5 border rounded-xl flex items-center justify-between text-left transition-all ${
                    active
                      ? "border-teal-600 bg-teal-50/40 shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center border ${entity.color}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 leading-tight">
                        {entity.label}
                      </h4>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">
                        {entity.category}
                      </p>
                    </div>
                  </div>

                  {/* Quantitative Pill badge */}
                  <div className="flex items-center gap-1.5">
                    {entityCounts.positives > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        +{entityCounts.positives}
                      </span>
                    )}
                    {entityCounts.negatives > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        -{entityCounts.negatives}
                      </span>
                    )}
                    {entityCounts.positives === 0 && entityCounts.negatives === 0 && (
                      <span className="text-[9px] font-semibold text-slate-300 font-mono uppercase bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                        Omitido
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Details Dashboard Column */}
          <div className="lg:col-span-8 bg-slate-50/50 border border-slate-200 rounded-xl p-5 md:p-6 shadow-xs space-y-6">
            
            {/* Context synthesis card */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                SÍNTESIS EDITORIAL ({politicalEntities.find((e) => e.id === activeEntityId)?.label})
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {currentEntityData?.mentions || "No se registran menciones consolidadas para esta identidad política."}
              </p>
            </div>

            {/* Citations split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Positive Citations Panel */}
              <div className="space-y-3">
                <h6 className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Menciones Favorables / Apoyos ({currentEntityData?.positives?.length || 0})
                </h6>

                {(!currentEntityData?.positives || currentEntityData.positives.length === 0) ? (
                  <div className="border border-slate-200 border-dashed rounded-lg p-5 text-center bg-white/50 text-xs text-slate-400 italic">
                    No se registran declaraciones de apoyo explícito o valoraciones favorables para este actor.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {currentEntityData.positives.map((p, i) => (
                      <div key={i} className="bg-white p-3.5 rounded-lg border border-emerald-100 space-y-2 hover:border-emerald-200 transition-colors">
                        <blockquote className="text-xs font-serif italic text-slate-800 font-medium pl-2.5 border-l-2 border-emerald-500">
                          "{p.quote}"
                        </blockquote>
                        <div className="bg-emerald-50/35 p-2 rounded text-[11px] text-slate-600 leading-relaxed">
                          <span className="font-bold text-emerald-800 text-[9px] uppercase tracking-wider block mb-0.5">LECTURA PERIODÍSTICA</span>
                          {p.analysis}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Negative Citations Panel */}
              <div className="space-y-3">
                <h6 className="text-[10px] font-bold uppercase tracking-widest text-rose-800 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                  Fricciones / Cuestionamientos ({currentEntityData?.negatives?.length || 0})
                </h6>

                {(!currentEntityData?.negatives || currentEntityData.negatives.length === 0) ? (
                  <div className="border border-slate-200 border-dashed rounded-lg p-5 text-center bg-white/50 text-xs text-slate-400 italic">
                    No se registran cuestionamientos, críticas ni fricciones explícitas dirigidas a este actor.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {currentEntityData.negatives.map((n, i) => (
                      <div key={i} className="bg-white p-3.5 rounded-lg border border-rose-100 space-y-2 hover:border-rose-200 transition-colors">
                        <blockquote className="text-xs font-serif italic text-slate-800 font-medium pl-2.5 border-l-2 border-rose-500">
                          "{n.quote}"
                        </blockquote>
                        <div className="bg-rose-50/35 p-2 rounded text-[11px] text-slate-600 leading-relaxed">
                          <span className="font-bold text-rose-800 text-[9px] uppercase tracking-wider block mb-0.5">LECTURA PERIODÍSTICA</span>
                          {n.analysis}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Full literal transcription browser panel */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs" id="transcription-browser">
        <div className="p-5 border-b border-[#E2E8F0] bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-slate-400" />
              REGISTRO DE TRANSCRIPCIÓN LÉXICA LITERAL
            </h3>
            <p className="text-xs text-slate-400">
              Verbatim completo e íntegro del audio provisto para verificación periodística.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              id="transcription-search"
              type="text"
              placeholder="Buscar cita o término..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 w-full sm:w-[260px] transition-all"
            />
          </div>
        </div>

        <div className="p-6 max-h-[420px] overflow-y-auto bg-slate-50/10" id="transcription-text-area">
          <div className="border border-slate-100 bg-white p-5 rounded-lg">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans whitespace-pre-line text-justify select-text">
              {highlightSearchText(result.transcription, searchTerm)}
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Seleccione cualquier bloque de texto para copiarlo para citas externas.</span>
          <span>Idiomas soportados: Español castellano</span>
        </div>
      </div>

    </div>
  );
}
