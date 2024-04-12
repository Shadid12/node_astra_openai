import { AstraDB } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    modelName: "gpt-3.5-turbo-1106",
    temperature: 0.5,
    openAIApiKey: process.env.OPENAI_API_KEY
});

export const setUpAndQueryAstraDB = async (docs, imgUrl) => {
    const { ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT } = process.env;

    // Initialize the client. The keyspace parameter is optional if you use "default_keyspace".
    const db = new AstraDB(
        ASTRA_DB_APPLICATION_TOKEN,
        ASTRA_DB_API_ENDPOINT,
        "default_keyspace"
    );

    // Create a collection. The default similarity metric is "cosine".
    await db.createCollection(
        "img_vectors",
        {
        "vector": {
            "dimension": 1536,
            "metric": "cosine"
        }
        }
    );
    const collection = await db.collection("img_vectors");
    console.log(collection);

    // 5. Process each document in the docs array
    for (const doc of docs) {
        console.log(`Processing image description`);
        // const txtPath = doc.metadata.source;
        const text = doc.message.content;
        console.log('this is the text ---->', text);

        // 6. Create RecursiveCharacterTextSplitter instance
        const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        });
        console.log("Splitting text into chunks...");

        // 7. Split text into chunks (documents)
        const chunks = await textSplitter.createDocuments([text]);
        console.log(`Text split into ${chunks.length} chunks`);
        console.log(
        `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`
        );

        // 8. Create OpenAI embeddings for documents
        const embeddingPromises = chunks.map(async (chunk) => {
        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: chunk.pageContent.replace(/\n/g, " "),
            encoding_format: "float",
            // dimensions: 1000
        });
        return embedding;
        });

        const embeddingsArrays = await Promise.all(embeddingPromises);
        console.log("Finished embedding documents");
        console.log(
        `Creating ${chunks.length} vectors array with id, values, and metadata...`
        );
        console.log('chunks --->', chunks);

        // 9. Insert all chunks as a batch with vectors
        const batchSize = 20;
        let batch = [];
        
        // Map chunks to documents with vectors
        const documentsWithVectors = chunks.map((chunk, idx) => ({
            id: `${imgUrl}_${idx}`,
            $vector: embeddingsArrays[idx].data[0].embedding,
            metadata: {
                ...chunk.metadata,
                loc: JSON.stringify(chunk.metadata.loc),
                pageContent: chunk.pageContent,
                imgUrl: imgUrl,
            },
        }));
        
        // Iterate over documentsWithVectors and push them into batches
        for (let idx = 0; idx < documentsWithVectors.length; idx++) {
            const document = documentsWithVectors[idx];
            batch.push(document);
        
            // When batch is full or it's the last item, insert the batch
            if (batch.length === batchSize || idx === documentsWithVectors.length - 1) {
                // Insert batch
                const results = await collection.insertMany(batch);
                // Empty the batch
                batch = [];
            }
        }

        console.log('Embeddings have been batch added to AstraDB');
    }
}