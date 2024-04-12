// 1. Import required modules
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { loadQAStuffChain } from "langchain/chains";
import { AstraDB } from "@datastax/astra-db-ts";
import axios from 'axios';
import { OpenAI } from "openai";
import * as dotenv from "dotenv";

dotenv.config();

export const queryAstraAndGPTForArtComparison = async (imgtoCompareUrl) => {
    const { ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT } = process.env;

    const db = new AstraDB(
        ASTRA_DB_APPLICATION_TOKEN,
        ASTRA_DB_API_ENDPOINT,
        "default_keyspace"
    );

    const collection = await db.collection("img_vectors");
    console.log('Successfully retreived', collection);

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    // 1. Analyze the new image we want to compare with our already embedded ones
    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
        {
            role: "user",
            content: [
            { 
                type: "text", 
                text: "Please give me a detailed description of what is in this image."
            },
            {
                type: "image_url",
                image_url: {
                "url": imgtoCompareUrl,
                },
            },
            ],
        },
        ],
    });
    // console.log('---------->', response.choices[0].message.content);
    const imageDescription = response.choices[0].message.content;

    // 2. Create query embedding
    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(imageDescription);
    console.log('this is the queryEmbedding --->', JSON.stringify(queryEmbedding));

    // 3. Query Astra collection and return top match
    const requestBody = {
        find: {
        sort: { "$vector": queryEmbedding },
        options: {
            limit: 1
        }
        }
    };

    const result = await axios.post(`${ASTRA_DB_API_ENDPOINT}/api/json/v1/default_keyspace/img_vectors`, requestBody, {
        headers: {
        'Token': ASTRA_DB_APPLICATION_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        }
    })

    console.log('This is the information of the image that is most similar to the one you provided', result.data.data.documents[0].metadata);
}