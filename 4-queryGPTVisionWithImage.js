import { OpenAI } from "openai";
import * as dotenv from "dotenv";

dotenv.config();

export const queryGPTVisionWithImage = async (img) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    console.log('------>', img);

    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
        {
            role: "user",
            content: [
            { type: "text", text: "Please give me a detailed description of what is in this image." },
            {
                type: "image_url",
                image_url: {
                "url": img,
                },
            },
            ],
        },
        ],
    });
    console.log(response.choices[0].message.content);
    return response.choices[0];
}