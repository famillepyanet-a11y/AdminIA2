import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface DocumentAnalysis {
  category: string;
  confidence: number;
  extractedData: Record<string, any>;
  summary: string;
  keyInformation: string[];
  documentType: string;
}

export async function analyzeDocument(
  text: string, 
  imageBase64?: string
): Promise<DocumentAnalysis> {
  try {
    const messages: any[] = [
      {
        role: "system",
        content: `You are an expert document analyzer. Analyze the provided document and extract key information.
        
        Categorize the document into one of these categories:
        - factures (invoices/bills)
        - contrats (contracts)
        - medical (medical documents)
        - legal (legal documents)
        - correspondence (letters/emails)
        - financial (bank statements, financial reports)
        - administrative (official documents)
        - other (other documents)
        
        Respond with JSON in this exact format:
        {
          "category": "category_name",
          "confidence": 0.95,
          "extractedData": {
            "key_field_1": "value1",
            "key_field_2": "value2"
          },
          "summary": "Brief summary of the document",
          "keyInformation": ["key point 1", "key point 2"],
          "documentType": "Specific document type"
        }`
      }
    ];

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: text || "Analyze this document image and extract key information."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: text
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      category: result.category || "other",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      extractedData: result.extractedData || {},
      summary: result.summary || "",
      keyInformation: result.keyInformation || [],
      documentType: result.documentType || "Unknown"
    };
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error("Failed to analyze document: " + error.message);
  }
}

export async function extractTextFromImage(base64Image: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this image. Return only the extracted text, no additional commentary."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("Failed to extract text from image: " + error.message);
  }
}
