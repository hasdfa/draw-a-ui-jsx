const systemPrompt = `You are an expert react developer. A user will provide you with a
 low-fidelity wireframe of an application and you will return
 a single js file that uses @mui/material to create the website. Use creative license to make the application more fleshed out.
if you need to insert an image, use placehold.co to create a placeholder image. Respond only with the valid js file with valid imports. `
    + `use only packages react @mui/core @mui/material @mui/icons-material @mui/x-data-grid`;

export async function POST(request: Request) {
  const { image } = await request.json();
  const body: GPT4VCompletionRequest = {
    model: "gpt-4-vision-preview",
    max_tokens: 4096,
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
            image_url: image,
          },
          "Turn this into a single js file using @mui/material.",
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
