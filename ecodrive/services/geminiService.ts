
import { GoogleGenAI } from "@google/genai";

export interface PlaceResult {
  name: string;
  address: string;
  uri?: string;
}

export interface SearchResponse {
  summary: string;
  places: PlaceResult[];
}

export interface DistanceResult {
  km: number;
  sourceUri?: string;
}

export const searchPlaces = async (query: string, coords?: { lat: number, lng: number }): Promise<SearchResponse> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      console.error("API Key não configurada. Verifique o arquivo .env.local");
      return { summary: "API Key não configurada. Verifique o arquivo .env.local", places: [] };
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Encontre locais que correspondam a: "${query}". Forneça um resumo do endereço.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: coords ? {
          retrievalConfig: {
            latLng: { latitude: coords.lat, longitude: coords.lng }
          }
        } : undefined
      },
    });

    const places: PlaceResult[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.maps) {
          places.push({
            name: chunk.maps.title || "Local encontrado",
            address: "",
            uri: chunk.maps.uri
          });
        }
      });
    }

    return {
      summary: response.text || "Nenhum resumo disponível.",
      places: places
    };
  } catch (error) {
    console.error("Erro ao buscar locais:", error);
    return { summary: "Erro na consulta. Verifique sua conexão.", places: [] };
  }
};

export const calculateDistance = async (origin: string, destination: string, coords?: { lat: number, lng: number }): Promise<DistanceResult> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      console.error("API Key não configurada. Verifique o arquivo .env.local");
      return { km: 0 };
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Qual é a distância exata de condução em quilômetros entre "${origin}" e "${destination}"? Responda o número decimal (use ponto para decimais). Se não encontrar, diga 0.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: coords ? {
          retrievalConfig: {
            latLng: { latitude: coords.lat, longitude: coords.lng }
          }
        } : undefined
      },
    });

    const text = response.text || "0";
    // Limpa o texto: troca vírgula por ponto e extrai o primeiro número
    const sanitizedText = text.replace(',', '.');
    const match = sanitizedText.match(/\d+(\.\d+)?/);

    const km = match ? parseFloat(match[0]) : 0;
    const sourceUri = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.maps?.uri;

    return { km, sourceUri };
  } catch (error) {
    console.error("Erro ao calcular distância:", error);
    return { km: 0 };
  }
};
