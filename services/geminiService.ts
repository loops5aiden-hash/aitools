import { GoogleGenAI, Chat, Modality, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import type { Agent, Tool, ProjectFile, AIType } from '../types';
import { ICON_MAP } from '../components/icons';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please add it to your environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- MOCK API FUNCTIONS ---
export const MOCK_API: { [key: string]: (args: any) => any } = {
  search_youtube: (args: { query: string }) => ({ results: [{ title: `Video about ${args.query}`, url: 'youtube.com' }] }),
  search_instagram: (args: { username: string }) => ({ username: args.username, followers: Math.floor(Math.random() * 10000) }),
  search_google: (args: { query: string }) => ({ results: [{ title: `Top result for ${args.query}`, snippet: 'This is a mock search result.' }] }),
  get_weather: (args: { city: string }) => ({ city: args.city, temp: `${Math.floor(Math.random() * 30 + 5)}°C`, condition: 'Sunny' }),
  find_recipe: (args: { dish: string }) => ({ recipe: `A lovely recipe for ${args.dish}`, ingredients: ['Ingredient A', 'Ingredient B'] }),
  lookup_dictionary: (args: { word: string }) => ({ word: args.word, definition: `A mock definition for ${args.word}.` }),
  translate_text: (args: { text: string, target_language: string }) => ({ translation: `Mock translation of "${args.text}" to ${args.target_language}` }),
  get_news: (args: { topic: string }) => ({ headlines: [`Top story about ${args.topic}`] }),
  get_stock_price: (args: { ticker: string }) => ({ ticker: args.ticker.toUpperCase(), price: `$${(Math.random() * 500 + 50).toFixed(2)}` }),
  search_flights: (args: { from: string, to: string }) => ({ flights: [{ airline: 'Gemini Air', flight: 'GA-123', price: `$${Math.floor(Math.random() * 500 + 200)}` }] }),
  search_hotels: (args: { city: string }) => ({ hotels: [{ name: `The Gemini Hotel ${args.city}`, price: `$${Math.floor(Math.random() * 200 + 80)}/night` }] }),
  find_restaurants: (args: { city: string, cuisine: string }) => ({ restaurants: [{ name: `The ${args.cuisine} Palace in ${args.city}` }] }),
  track_package: (args: { tracking_number: string }) => ({ status: `Package ${args.tracking_number} is out for delivery.` }),
  get_word_of_the_day: () => ({ word: 'Ephemeral', definition: 'Lasting for a very short time.' }),
  get_random_fact: () => ({ fact: 'Honey never spoils.' }),
  get_quote: () => ({ quote: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' }),
  shorten_url: (args: { url: string }) => ({ short_url: 'https://short.url/mock' }),
  search_images: (args: { query: string }) => ({ images: [{ url: `https://images.com/mock-for-${args.query}` }] }),
  calculate_math: (args: { expression: string }) => ({ result: '42' }),
  convert_units: (args: { value: number, from_unit: string, to_unit: string }) => ({ result: `${args.value * 2.2} ${args.to_unit}` }),
  get_current_time: (args: { timezone: string }) => ({ time: `12:34 PM in ${args.timezone}` }),
  get_world_clock: (args: { city: string }) => ({ time: `3:45 AM in ${args.city}` }),
  lookup_ip: (args: { ip_address: string }) => ({ location: 'Mock City, Mock Country' }),
  get_domain_whois: (args: { domain: string }) => ({ registrar: 'Mock Registrar', registered: '2023-01-01' }),
  generate_password: (args: { length: number }) => ({ password: 'MockSecurePassword123!' }),
};

const createFunctionDeclarations = (tools: Tool[]): FunctionDeclaration[] => {
    return tools.map(tool => {
        const properties: { [key: string]: { type: Type, description: string } } = {};
        const required: string[] = [];
        const argRegex = /<(\w+)>|\[(\w+)\]/g;
        let match;
        while ((match = argRegex.exec(tool.command)) !== null) {
            const argName = match[1] || match[2];
            properties[argName] = { type: Type.STRING, description: `The ${argName.replace(/_/g, ' ')} for the command.` };
            if (match[1]) required.push(argName);
        }
        
        if (tool.isCustom && !MOCK_API[tool.id]) {
            MOCK_API[tool.id] = (args: any) => ({
                status: `Custom tool '${tool.name}' executed successfully with args: ${JSON.stringify(args)}`,
            });
        }

        return {
            name: tool.id,
            description: tool.description,
            parameters: { type: Type.OBJECT, properties, required },
        };
    });
};

export const startChat = (agent: Agent, tools: Tool[]): Chat => {
  const model = 'gemini-2.5-flash';
  const functionDeclarations = createFunctionDeclarations(tools);
  const chat: Chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: agent.systemInstruction,
      tools: [{ functionDeclarations }],
    },
  });
  return chat;
};

export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg'
        },
    });
    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    throw new Error("No image was generated.");
};

// --- MAKER STUDIO AI FUNCTIONS ---
const availableIcons = Object.keys(ICON_MAP);

const agentSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'A short, creative name for the agent (e.g., "Cosmic Poet"). Max 20 chars.' },
        description: { type: Type.STRING, description: 'A brief, one-sentence description of the agent\'s purpose. Max 50 chars.' },
        systemInstruction: { type: Type.STRING, description: 'A detailed system instruction defining the agent\'s personality, goals, and constraints. This is the most important part.' },
        welcomeMessage: { type: Type.STRING, description: 'A friendly welcome message for the user. Should include the placeholder "{user}".' },
        icon: { type: Type.STRING, description: `The name of an icon that best represents the agent. Must be one of: ${availableIcons.join(', ')}` },
    },
    required: ['name', 'description', 'systemInstruction', 'welcomeMessage', 'icon'],
};

export const generateAgentConfig = async (prompt: string): Promise<any> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: `Based on the following prompt, generate a complete configuration for a new AI agent. Be creative but adhere strictly to the schema. Prompt: "${prompt}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: agentSchema,
        },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

const toolSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'A short, descriptive name for the tool (e.g., "Movie Finder"). Max 20 chars.' },
        description: { type: Type.STRING, description: 'A brief, one-sentence description of the tool\'s purpose. Max 50 chars.' },
        command: { type: Type.STRING, description: 'The command structure for the tool. Use <arg> for required arguments and [arg] for optional ones (e.g., "/movie <title> [year]").' },
        icon: { type: Type.STRING, description: `The name of an icon that best represents the tool. Must be one of: ${availableIcons.join(', ')}` },
    },
    required: ['name', 'description', 'command', 'icon'],
};

export const generateToolConfig = async (prompt: string): Promise<any> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: `Based on the following prompt, generate a complete configuration for a new command-line tool. The tool's ID will be generated from its name. Adhere strictly to the schema. Prompt: "${prompt}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: toolSchema,
        },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


// --- MULTI-AGENT BUILDER AI FUNCTIONS ---
const projectPlanSchema = {
    type: Type.OBJECT,
    properties: {
        tasks: {
            type: Type.ARRAY,
            description: "A list of development tasks required to build the project.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier for the task, e.g., 'task-1'." },
                    description: { type: Type.STRING, description: "A concise description of the task." }
                },
                required: ["id", "description"]
            }
        },
        files: {
            type: Type.ARRAY,
            description: "A list of all the code files needed for the project.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The full filename, e.g., 'index.html' or 'style.css' or 'script.js'." },
                    content: { type: Type.STRING, description: "The complete code content for this file." }
                },
                required: ["name", "content"]
            }
        }
    },
    required: ["tasks", "files"]
};

export const generateProjectPlanAndCode = async (prompt: string): Promise<any> => {
     const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: `You are an expert full-stack web developer AI. Your task is to generate a complete, self-contained, and interactive web component based on a user's prompt. The project must be modern, visually appealing, and functional.

        **Requirements:**
        1.  **Structure:** Create three files: \`index.html\`, \`style.css\`, and \`script.js\`.
        2.  **HTML:** The HTML should be well-structured and semantic. It must link to the CSS and JS files correctly.
        3.  **CSS:** The CSS should be clean, responsive, and provide a modern aesthetic. Use Flexbox or Grid for layout.
        4.  **JavaScript:** The JavaScript file must contain all the logic to make the component interactive. Do not use inline JS in the HTML.
        
        **User Prompt:** "${prompt}"
        
        Generate a JSON object that includes a list of development tasks and a list of all three files with their full content. Adhere strictly to the provided schema.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: projectPlanSchema,
        },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

const projectEditSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A brief, one-sentence summary of the changes you made for the chat history." },
        files: {
            type: Type.ARRAY,
            description: "A list of *all* the project's code files, including the ones you modified and the ones you didn't.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The full filename, e.g., 'index.html' or 'style.css'." },
                    content: { type: Type.STRING, description: "The complete, updated code content for this file." }
                },
                required: ["name", "content"]
            }
        }
    },
    required: ["summary", "files"]
};

export const editProjectCode = async (prompt: string, existingFiles: ProjectFile[]): Promise<any> => {
    const fileContext = existingFiles.map(f => `\`\`\`${f.name}\n${f.content}\n\`\`\``).join('\n\n');
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: `You are an expert web developer AI. The user wants to modify an existing project.
        
        Here are the current files:
        ${fileContext}
        
        Here is the user's edit request: "${prompt}"
        
        Based on the request, intelligently modify the code to achieve the user's goal. Ensure the project remains fully functional and self-contained. Return a JSON object containing a brief summary of your changes and the *complete, updated content for all files* in the project, even the unchanged ones. Adhere strictly to the provided schema.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: projectEditSchema,
        },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


// --- PromptFlow AI Feature Functions ---

const videoResponseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        promptText: {
          type: Type.STRING,
          description: 'The full, detailed video prompt text.',
        },
      },
      required: ['promptText'],
    },
};

export const generateVideoPrompts = async (
    seedPrompt: string,
    aiType: AIType,
    numPrompts: number,
    aspectRatio: string,
): Promise<{ promptText: string }[]> => {
    const fullPrompt = `
        Based on the following topic and parameters, generate ${numPrompts} distinct and creative video prompts suitable for the ${aiType} AI video generation model.
        Topic: "${seedPrompt}"
        Aspect Ratio: "${aspectRatio}"
        Each prompt should be a detailed, single paragraph describing a visually rich scene.
        Focus on cinematic language, describing camera shots, lighting, character actions, environment, and atmosphere.
        Ensure the output is a JSON array of objects, where each object has a single key "promptText".
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: videoResponseSchema,
                temperature: 0.8,
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating prompts with Gemini:", error);
        throw new Error("Failed to parse response from Gemini API.");
    }
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [ { inlineData: { data: base64ImageData, mimeType: mimeType, }, }, { text: prompt, }, ], },
            config: { responseModalities: [Modality.IMAGE], },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) return part.inlineData.data;
        }
        throw new Error("No edited image was returned.");
    } catch (error) {
        console.error("Error editing image with Gemini:", error);
        throw new Error("Failed to edit image with Gemini API.");
    }
};

export const generateVideo = async (
    prompt: string,
    image: { data: string, mimeType: string } | null,
    onProgress: (message: string) => void
): Promise<string> => {
    onProgress('Initializing video generation...');
    try {
        const generationPayload: any = {
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
        };
        if (image) {
            generationPayload.image = { imageBytes: image.data, mimeType: image.mimeType };
        }
        let operation = await ai.models.generateVideos(generationPayload);
        onProgress('Request sent. Waiting for the model...');
        const messages = [
            'Warming up the pixels...', 'Choreographing the digital dance...',
            'Rendering the visual symphony...', 'Almost there, adding the final touches...',
        ];
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            onProgress(messages[Math.floor(Math.random() * messages.length)]);
            operation = await ai.operations.getVideosOperation({operation: operation});
        }
        onProgress('Video generated successfully!');
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("Video link not found.");
        const response = await fetch(`${downloadLink}&key=${API_KEY}`);
        if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        onProgress(`Error: ${errorMessage}`);
        throw new Error(`Failed to generate video: ${errorMessage}`);
    }
};

const terminalCommandSchema = {
    type: Type.OBJECT,
    properties: {
        command: {
            type: Type.STRING,
            description: "The parsed command name. Must be one of: 'generate_image', 'generate_video_prompts', 'generate_video', 'help', 'clear', 'unknown'.",
        },
        args: {
            type: Type.OBJECT,
            properties: {
                prompt: { type: Type.STRING, description: "The main user prompt text." },
                count: { type: Type.INTEGER, description: "Number of items to generate. Default is 3." },
                model: { type: Type.STRING, description: "The target AI model, e.g., 'sora' or 'veo'. Default is 'sora'." },
                aspectRatio: { type: Type.STRING, description: "The aspect ratio, e.g., '16:9', '1:1'. Default is '16:9'." },
            },
        },
    },
    required: ['command'],
};

export const interpretTerminalCommand = async (userInput: string): Promise<any> => {
    const systemInstruction = `You are an intelligent command-line interpreter for a creative AI app. Your task is to parse user input, which can be a formal command or a natural language request, into a structured JSON command.
- Infer the user's intent from their language.
- If they ask to create, generate, or make an image, map to the 'generate_image' command.
- If they ask for video ideas, prompts, or scripts, map to 'generate_video_prompts'.
- If they want to create or generate a video, map to 'generate_video'.
- Keywords like 'help', '?', or 'man' map to the 'help' command.
- 'clear', 'cls', or 'reset' maps to 'clear'.
- Extract the core creative request into the 'prompt' argument.
- Extract parameters like 'count:', 'for:' (for the model), 'aspect:', or 'ar:' (for aspect ratio) if they are present in the prompt.
- If the user's intent does not match any of the creative commands (image/video), or is a general question, map to the 'unknown' command.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userInput,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: terminalCommandSchema,
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error interpreting command:", error);
        return { command: 'unknown', args: { prompt: `Error parsing command: ${userInput}` } };
    }
};