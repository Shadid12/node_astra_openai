import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import * as dotenv from "dotenv";
import { setUpAndUpdateAstra } from './1-setUpAndUpdateAstra.js';
import { queryAstraAndQueryGPT } from "./2-queryAstraAndQueryGPT.js";

dotenv.config();

// 1. Set up DirectoryLoader to load documents from the ./documents directory
const loader = new DirectoryLoader("./documents", {
    ".txt": (path) => new TextLoader(path),
    ".pdf": (path) => new PDFLoader(path),
});
const docs = await loader.load();
const title_book = docs[0].metadata.source.split('/').pop()

// 2. Set up variables for the filename, question, and index settings
const question = "In the book Romeo and Juliet, what happens to Juliet?";
const indexName = "text_vectors";
const vectorDimension = 1536;

// 3. Run the main async function
(async () => {
// 4. Check if Astra collection exists and create if necessary, Update Astra vector store with document embeddings
    // await setUpAndUpdateAstra(docs, title_book)
// 5. Query Astra vector store and GPT model for an answer
    await queryAstraAndQueryGPT(question);
})();