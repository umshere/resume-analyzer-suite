export interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

export interface LLMProvider {
  analyze(prompt: string): Promise<LLMResponse>;
}

export class LocalLLMProvider implements LLMProvider {
  private endpoint: string;

  constructor(
    endpoint: string = process.env.LLM_ENDPOINT || "http://localhost:1234"
  ) {
    this.endpoint = endpoint;
  }

  async analyze(prompt: string): Promise<LLMResponse> {
    const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "local-model",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM request failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export class GeminiProvider implements LLMProvider {
  private apiKey: string;

  constructor(apiKey: string = process.env.GEMINI_API_KEY || "") {
    this.apiKey = apiKey;
  }

  async analyze(prompt: string): Promise<LLMResponse> {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Convert Gemini response format to standard LLMResponse
    return {
      choices: [
        {
          message: {
            content: result.candidates[0].content.parts[0].text,
            role: "assistant",
          },
        },
      ],
    };
  }
}

export class OpenRouterProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(
    apiKey: string = process.env.OPENROUTER_API_KEY || "",
    model: string = "mistral-7b-instruct"
  ) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyze(prompt: string): Promise<LLMResponse> {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouter request failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export function createLLMProvider(
  provider: string = process.env.LLM_PROVIDER || "local"
): LLMProvider {
  switch (provider.toLowerCase()) {
    case "gemini":
      return new GeminiProvider();
    case "openrouter":
      return new OpenRouterProvider();
    case "local":
    default:
      return new LocalLLMProvider();
  }
}
