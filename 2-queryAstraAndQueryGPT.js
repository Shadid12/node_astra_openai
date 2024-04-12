// 1. Import required modules
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { AstraDB } from "@datastax/astra-db-ts";
import axios from 'axios';

// 2. Export the queryAstraAndQueryGPT function
export const queryAstraAndQueryGPT = async (question) => {
// 3. Start query process
  console.log("Querying Astra vectors...");
// 4. Retrieve the Astra collection
    const { ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT } = process.env;

    const db = new AstraDB(
        ASTRA_DB_APPLICATION_TOKEN,
        ASTRA_DB_API_ENDPOINT,
        "default_keyspace"
    );

    const collection = await db.collection("text_vectors");
    console.log('Successfully retreived', collection);
// 5. Create query embedding
  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);
  console.log('this is the queryEmbedding --->', JSON.stringify(queryEmbedding));

// 6. Query Astra collection and return top 10 matches
const requestBody = {
    find: {
      sort: { "$vector": queryEmbedding },
      options: {
        limit: 5
      }
    }
};

const result = await axios.post(`${ASTRA_DB_API_ENDPOINT}/api/json/v1/default_keyspace/text_vectors`, requestBody, {
  headers: {
    'Token': ASTRA_DB_APPLICATION_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

console.log('This is the query Response ---->', result.data.data.documents[0].metadata.pageContent);

// 7. Log the number of matches 
console.log(`Found ${result.data.data.documents.length} matches...`);
// 8. Log the question being asked
    console.log(`Asking question: ${question}...`);
    if (result.data.data.documents) {
// 9. Create an OpenAI instance and load the QAStuffChain
    const llm = new OpenAI({
      modelName: "gpt-3.5-turbo-1106",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    const chain = loadQAStuffChain(llm);
// 10. Extract and concatenate page content from matched documents
    const concatenatedPageContent = result.data.data.documents
    .map((match) => match.metadata.pageContent)
    .join(" ");
// 11. Execute the chain with input documents and question
    console.log(`Concatenated page content:-->`, JSON.stringify(concatenatedPageContent));
    const finalResult = await chain.call({
      input_documents: [new Document({ pageContent: concatenatedPageContent })],
      question: question,
    });
// 12. Log the answer
    console.log(`Answer: ${finalResult.text}`);
  } else {
// 13. Log that there are no matches, so GPT-3 will not be queried
    console.log("Since there are no matches, GPT will not be queried.");
  }
};