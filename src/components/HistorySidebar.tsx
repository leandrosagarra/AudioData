/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { JournalHistoryItem } from "../types";
import { Mic, FileText, Trash2, Clock, ChevronRight, Award } from "lucide-react";

interface HistorySidebarProps {
  items: JournalHistoryItem[];
  selectedId: string | null;
  onSelect: (item: JournalHistoryItem) => void;
  onDelete: (id: string) => void;
}

export default function HistorySidebar({ items, selectedId, onSelect, onDelete }: HistorySidebarProps) {
  return (
    <div className="space-y-4" id="history-sidebar-container">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Archivo de Auditorías ({items.length})
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="border border-slate-200 border-dashed rounded-xl p-6 text-center bg-slate-50/40">
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            No se registran auditorías guardadas en este navegador. Las carpetas de análisis aparecerán aquí al procesar fuentes de audio o texto.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1" id="history-items-list">
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            const dateStr = new Date(item.timestamp).toLocaleDateString("es-AR", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className={`group relative border rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-teal-50 border-teal-300 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
                onClick={() => onSelect(item)}
              >
                <div className="p-3.5 pr-10">
                  <div className="flex items-center gap-2 mb-1">
                    {item.type === "audio" ? (
                      <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center text-[10px]">
                        <Mic className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                        <FileText className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono font-medium">{dateStr}</span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-700 line-clamp-2 leading-snug group-hover:text-slate-900 transition-colors">
                    {item.title}
                  </h3>

                  {item.type === "audio" && item.fileName && (
                    <span className="text-[9px] text-slate-400 block mt-1 truncate">
                      Archivo: {item.fileName} {item.fileSize ? `(${item.fileSize})` : ""}
                    </span>
                  )}
                  {item.type === "text" && item.pastedTextSnippet && (
                    <span className="text-[9px] text-slate-400 block mt-1 italic truncate max-w-full">
                      "{item.pastedTextSnippet}"
                    </span>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all text-slate-400">
                  <ChevronRight className="w-4 h-4" />
                </div>

                {/* Delete button wrapper */}
                <button
                  type="button"
                  title="Eliminar registro"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`¿Está seguro de eliminar el reporte "${item.title}"?`)) {
                      onDelete(item.id);
                    }
                  }}
                  className="absolute right-2 top-2 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Journalist credibility badge */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-amber-400" />
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-sans">
            Garantía Periodística
          </h4>
        </div>
        <p className="text-[10px] text-slate-300 leading-normal font-sans">
          Auditoría de alta precisión con inteligencia artificial. Extracción estricta de citas literales en contexto para preservar la neutralidad informativa y mitigar desvíos interpretativos.
        </p>
      </div>
    </div>
  );
}
