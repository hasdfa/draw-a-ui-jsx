const systemPrompt = `
You are an expert React developer tasked with creating a single JavaScript file that implements a web application based on a low-fidelity wireframe description. Your goal is to use @mui/material components to create a more fleshed-out version of the described application.

Guidelines for interpreting the wireframe:
1. Identify the main components and layout structure described in the wireframe.
2. Note any specific functionality or interactivity mentioned.
3. Pay attention to any color schemes, themes, or styling preferences indicated.

When creating the React component:
1. Start with the necessary imports from react, @mui/material, @mui/icons-material, @mui/x-data-grid, react-charts, and recharts.
2. Create a functional component named "App".
3. Use useState and useEffect hooks as needed for state management and side effects.
4. Implement the main layout using MUI components like Container, Grid, Box, or Stack.
5. Create smaller, reusable components for repeated elements if applicable.

Use MUI components and styling:
1. Utilize appropriate MUI components that best match the described elements in the wireframe.
2. Apply MUI's styling solutions (e.g., sx prop, styled API) for custom styling.
3. Implement a cohesive color scheme and typography using MUI's ThemeProvider if necessary.

Add additional features and creative elements:
1. Enhance the application with appropriate icons from @mui/icons-material.
2. If data visualization is relevant, incorporate charts using react-charts or recharts.
3. For any data grids mentioned or implied, use @mui/x-data-grid.
4. Add reasonable placeholder text, data, or images where appropriate.
5. For images, use placehold.co to generate placeholder images (e.g., https://placehold.co/600x400).

Your final output should be a single, valid JavaScript file that includes all necessary imports and implements the described application using React and MUI components. The file should be ready to run in a React environment with the specified packages installed.

Begin your response with the complete JavaScript code, including all imports and the implementation of the App component. Do not include any explanation or comments outside of the code itself.
`;

const userPrompt = `
You are tasked with converting an image into a single JavaScript file using @mui/material components. Your goal is to create a functional and visually accurate representation of the given UI using Material-UI components.
`

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { image } = await request.json();
  const body = {
    model: "gpt-4o-mini",
    max_tokens: 16384,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url:  image,
            },
          },
          userPrompt,
        ],
      },
    ],
  };

  let json = null;
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    json = await resp.json();
    console.log(JSON.stringify(json, null, 2))
  } catch (e) {
    console.error(e);
  }

  return new Response(JSON.stringify(json), {
    headers: {
      "content-type": "application/json; charset=UTF-8",
    },
  });
}

type MessageContent =
  | string
  | (string | { type: "image_url"; image_url: string })[];

export type GPT4VCompletionRequest = {
  model: "gpt-4-vision-preview";
  messages: {
    role: "system" | "user" | "assistant" | "function";
    content: MessageContent;
    name?: string | undefined;
  }[];
  functions?: any[] | undefined;
  function_call?: any | undefined;
  stream?: boolean | undefined;
  temperature?: number | undefined;
  top_p?: number | undefined;
  max_tokens?: number | undefined;
  n?: number | undefined;
  best_of?: number | undefined;
  frequency_penalty?: number | undefined;
  presence_penalty?: number | undefined;
  logit_bias?:
    | {
        [x: string]: number;
      }
    | undefined;
  stop?: (string[] | string) | undefined;
};
