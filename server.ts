/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Unified Analysis JSON Schema to pass to Gemini
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    transcription: {
      type: Type.STRING,
      description: "La transcripción completa literal y textual del audio provisto. Si sólo se proveyó texto, mantener el texto original completo aquí.",
    },
    summary: {
      type: Type.STRING,
      description: "Un resumen periodístico profundo, analítico y plenamente objetivo del contexto y de lo expresado en la entrevista.",
    },
    keyPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Puntos clave y reflexiones políticas nucleares identificadas en el contenido.",
    },
    relevantQuotes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          quote: { type: Type.STRING, description: "Cita textual exacta de la declaración." },
          context: { type: Type.STRING, description: "Quién lo dijo y el contexto de la frase." }
        },
        required: ["quote", "context"]
      },
      description: "Las citas más destacadas del contenido general.",
    },
    politicalAnalysis: {
      type: Type.OBJECT,
      properties: {
        axel_kicillof: {
          type: Type.OBJECT,
          properties: {
            mentions: { type: Type.STRING, description: "Análisis y resumen general sobre lo mencionado de Axel Kicillof." },
            positives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: "Cita textual exacta donde se expresa un comentario positivo, de apoyo, constructivo o de elogio." },
                  analysis: { type: Type.STRING, description: "Análisis periodístico objetivo y sin sesgos de este comentario." }
                },
                required: ["quote", "analysis"]
              }
            },
            negatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: "Cita textual exacta donde se expresa un comentario o alusión negativa, de crítica, de fricción o disconforme." },
                  analysis: { type: Type.STRING, description: "Análisis periodístico objetivo y sin sesgos de este comentario." }
                },
                required: ["quote", "analysis"]
              }
            }
          },
          required: ["mentions", "positives", "negatives"]
        },
        peronismo: {
          type: Type.OBJECT,
          properties: {
            mentions: { type: Type.STRING, description: "Análisis y resumen general sobre lo mencionado del Peronismo en general." },
            positives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: "Cita textual exacta donde se expresa un comentario positivo, de apoyo o de elogio respecto al peronismo." },
                  analysis: { type: Type.STRING, description: "Análisis periodístico objetivo y sin sesgos de este comentario." }
                },
                required: ["quote", "analysis"]
              }
            },
            negatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: "Cita textual exacta donde se expresa una crítica o alusión negativa hacia el peronismo o su vigencia actual." },
                  analysis: { type: Type.STRING, description: "Análisis periodístico objetivo y sin sesgos de este comentario." }
                },
                required: ["quote", "analysis"]
              }
            }
          },
          required: ["mentions", "positives", "negatives"]
        },
        cristina_kirchner: {
          type: Type.OBJECT,
          properties: {
            mentions: { type: Type.STRING, description: "Análisis y resumen general sobre lo mencionado de Cristina Fernández de Kirchner." },
            positives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: "Cita textual exacta donde se expresa un comentario positivo, de apoyo o elogio hacia Cristina Kirchner." },
                  analysis: { type: Type.STRING, description: "Análisis periodístico objetivo y sin sesgos de este comentario." }
                },
                required: ["quote", "analysis"]
              }
            },
            negatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: "Cita textual exacta de crítica, tensión, desaprobación o cuestionamiento hacia Cristina Kirchner." },
                  analysis: { type: Type.STRING, description: "Análisis periodístico objetivo y sin sesgos de este comentario." }
                },
                required: ["quote", "analysis"]
              }
            }
          },
          required: ["mentions", "positives", "negatives"]
        },
        la_campora: {
          type: Type.OBJECT,
          properties: {
            mentions: { type: Type.STRING, description: "Análisis y resumen general sobre lo mencionado de La Cámpora." },
            positives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: "Cita textual exacta donde se expresa un comentario positivo o de cercanía con La Cámpora." },
                  analysis: { type: Type.STRING, description: "Análisis periodístico objetivo y sin sesgos de este comentario." }
                },
                required: ["quote", "analysis"]
              }
            },
            negatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: "Cita de desaprobación, crítica, discrepancia o comentario de tensión/negativo hacia La Cámpora." },
                  analysis: { type: Type.STRING, description: "Análisis periodístico objetivo y sin sesgos de este comentario." }
                },
                required: ["quote", "analysis"]
              }
            }
          },
          required: ["mentions", "positives", "negatives"]
        },
        maximo_kirchner: {
          type: Type.OBJECT,
          properties: {
            mentions: { type: Type.STRING, description: "Análisis y resumen general sobre lo mencionado de Máximo Kirchner." },
            positives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: "Cita textual de valoración positiva, alineamiento o elogio hacia Máximo Kirchner." },
                  analysis: { type: Type.STRING, description: "Análisis periodístico objetivo y sin sesgos de este comentario." }
                },
                required: ["quote", "analysis"]
              }
            },
            negatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: "Cita textual de valoración negativa, crítica, reproche o desacuerdo abierto con Máximo Kirchner o su liderazgo." },
                  analysis: { type: Type.STRING, description: "Análisis periodístico objetivo y sin sesgos de este comentario." }
                },
                required: ["quote", "analysis"]
              }
            }
          },
          required: ["mentions", "positives", "negatives"]
        }
      },
      required: ["axel_kicillof", "peronismo", "cristina_kirchner", "la_campora", "maximo_kirchner"]
    },
    economicAnalysis: {
      type: Type.OBJECT,
      properties: {
        pbaEconomy: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Síntesis y diagnóstico periodístico riguroso sobre temas, políticas, presupuestos, impuestos u obras de la economía de la Provincia de Buenos Aires (PBA)." },
            quotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: "Cita literal e íntegra del entrevistado abordando la economía bonaerense." },
                  analysis: { type: Type.STRING, description: "Análisis técnico y periodísticamente neutral del impacto de dicha afirmación o reclamo económico provincial." }
                },
                required: ["quote", "analysis"]
              }
            }
          },
          required: ["summary", "quotes"]
        },
        nationalEconomy: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Síntesis y diagnóstico macroeconómico a nivel de la República Argentina (inflación, FMI, tipo de cambio, medidas nacionales o rumbo productivo argentino)." },
            quotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: "Cita literal e íntegra del entrevistado abordando temas económicos de la Nación." },
                  analysis: { type: Type.STRING, description: "Análisis neutral y profundo de la declaración económica nacional." }
                },
                required: ["quote", "analysis"]
              }
            }
          },
          required: ["summary", "quotes"]
        }
      },
      required: ["pbaEconomy", "nationalEconomy"]
    }
  },
  required: ["transcription", "summary", "keyPoints", "relevantQuotes", "politicalAnalysis", "economicAnalysis"]
};

const systemInstruction = `Eres un periodista político y económico senior de investigación de Argentina, con amplia trayectoria y obsesión por la objetividad absoluta y el rigor documental.
Tu tarea es analizar el audio provisto (o el texto de la entrevista provisto) para realizar una transcripción literal impecable (si se provee un audio), un resumen periodístico, identificar los puntos clave, y extraer citas de trascendencia política y económica.

Deberás auditar minuciosamente el contenido para identificar menciones, comentarios, posicionamientos, elogios y críticas relacionadas con los siguientes 5 actores políticos clave:
1. El gobernador Axel Kicillof.
2. El Peronismo (movimiento, partido político o doctrina).
3. La ex presidenta Cristina Fernández de Kirchner (o CFK).
4. La agrupación política La Cámpora.
5. Su líder Máximo Kirchner.

Para cada uno de estos 5 actores, debes agrupar los comentarios en positivos y negativos incluyendo las frases textuales literales exactas.

Además, debes aislar de manera específica las declaraciones y debates sobre cuestiones económicas, estructuradas de forma independiente para:
A) La economía de la Provincia de Buenos Aires (PBA) (ej. presupuestos bonaerenses, coparticipación, recaudación provincial, obras o recursos provinciales).
B) La economía a nivel nacional / Argentina (ej. inflación, tipo de cambio, ajuste, FMI, políticas macroeconómicas o producción general argentina).

*REGLA CRÍTICA DE OBLIGATORIEDAD*:
Debes extraer las citas textuales EXACTAS (tal cual se dicen en el audio/texto) en el campo "quote" para evitar malinterpretaciones. No parafrasear ni omitir términos importantes de la cita.
Si de un actor político o dimensión económica NO hay menciones o afirmaciones, escribe síntesis neutrales indicando 'No se registran declaraciones en este bloque para este análisis' y deja los arreglos de citas vacíos.
El análisis que realices para cada cita en el campo "analysis" debe ser completamente objetivo, analítico y neutral.
Entrega la respuesta estructurada estrictamente en formato JSON de acuerdo con el esquema provisto. TODO el contenido generado por ti debe estar escrito en idioma español de Argentina/latinoamericano.`;

// Lazy initialize client helper to avoid startup crash in missing key envs
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no se encuentra configurada en el servidor.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set relaxed limits for audio/text payloads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Main Journalistic Analysis Endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { type, content, fileBase64, mimeType, filename } = req.body;

      if (!type || (type === "text" && !content) || (type === "audio" && !fileBase64)) {
        res.status(400).json({ error: "Faltan parámetros requeridos: tipo o contenido inválidos." });
        return;
      }

      const client = getGeminiClient();
      let contentsInput: any[] = [];

      if (type === "audio") {
        let resolvedMime = mimeType || "audio/mp3";
        // Normalize common variations of mp3/mpeg MIME types for ultimate Gemini compatibility
        if (
          resolvedMime.includes("mp3") ||
          resolvedMime.includes("mpeg") ||
          resolvedMime.includes("mpg") ||
          resolvedMime.includes("octet-stream")
        ) {
          resolvedMime = "audio/mp3";
        }

        const audioPart = {
          inlineData: {
            mimeType: resolvedMime,
            data: fileBase64,
          },
        };
        contentsInput = [
          audioPart,
          "Analiza este audio periodístico transcribiendo el material y descomponiendo rigurosamente los posicionamientos sobre Kicillof, Peronismo, Cristina Fernández de Kirchner, La Cámpora y Máximo Kirchner como dictan tus instrucciones."
        ];
      } else {
        contentsInput = [
          `Analiza este texto periodístico adjunto:\n\n${content}\n\nDescompón rigurosamente los posicionamientos sobre Kicillof, Peronismo, Cristina Fernández de Kirchner, La Cámpora y Máximo Kirchner como dictan tus instrucciones.`
        ];
      }

      console.log(`Starting analysis for type: ${type}. Sending requests to Gemini...`);

      let response = null;
      let lastError = null;
      const modelsToTry = ["gemini-2.5-flash", "gemini-3.5-flash"];

      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting analysis with model: ${modelName}`);
          response = await client.models.generateContent({
            model: modelName,
            contents: contentsInput,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: analysisSchema,
              temperature: 0.1, // Low temperature for high objectivity & precision
            },
          });
          console.log(`Analysis successfully completed with model: ${modelName}`);
          break; // Break loop on success
        } catch (err: any) {
          console.warn(`Model ${modelName} failed or was unavailable:`, err.message || err);
          lastError = err;
        }
      }

      if (!response) {
        throw new Error(
          `Todos los modelos de análisis de IA están experimentando alta demanda en este momento. Por favor, reintente en unos instantes. (Detalle: ${lastError?.message || lastError})`
        );
      }

      const responseText = response.text;
      if (!responseText) {
        throw new Error("El modelo Gemini no devolvió texto de respuesta.");
      }

      // Parse and send the structured JSON response
      const parsedResult = JSON.parse(responseText);
      res.json(parsedResult);

    } catch (error: any) {
      console.error("Analysis Error:", error);
      res.status(500).json({
        error: error.message || "Error desconocido al procesar el análisis con el modelo de IA.",
      });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Senior Journalist Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Startup error:", err);
});
