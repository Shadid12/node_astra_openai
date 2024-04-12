import { queryGPTVisionWithImage } from "./4-queryGPTVisionWithImage.js";
import { setUpAndQueryAstraDB } from "./5-setUpAndQueryAstraDB.js";
import { queryAstraAndGPTForArtComparison } from "./6-queryAstraAndGPTForArtComparison.js";
import * as dotenv from "dotenv";

dotenv.config();

(async () => {
    const imgUrl = "https://www.petplace.com/article/breed/media_1324bc93dbf93c9cadcdffb9b06b5fda4d4f91d3f.jpeg"
    const imgToCompareUrl = "https://www.telegraph.co.uk/content/dam/news/2019/08/03/TELEMMGLPICT000205414364_trans_NvBQzQNjv4BqBJu0T4KjspztFWJiMmYxAYT8KUqaMF1JLCo-JT94AMM.jpeg"
    // 1. Await image description from vision
    // const imageDescription = await queryGPTVisionWithImage(imgUrl);
    // console.log(imageDescription)

    // 2. Check if Astra index exists and create if necessary and store document embeddings
    // const docs = [imageDescription]
    // const fakeImgDescription = [
    //     {
    //         index: 0,
    //         message: {
    //           role: 'assistant',
    //           content: 'The image shows a beautiful natural landscape under what appears to be early evening light or late afternoon sunshine. The focal point is a straight wooden boardwalk or path that starts from the foreground and extends into the middle of the frame, drawing the eye towards the horizon. It is nestled within a field of tall, lush green grass, suggesting that the boardwalk is there to allow people to walk through the area without disturbing the vegetation. To the right of the boardwalk, the grass gives way to a thicket of shrubs and small trees, with their leaves exhibiting hues of green with some touches of reddish-brown, indicating either the onset of autumn or the presence of different plant species. The sky above is a picturesque combination of various shades of blue and is dotted with white, fluffy clouds. The clouds are scattered and do not cover the entire sky, allowing plenty of blue to be visible, which suggests good weather. These elements come together to create a serene and inviting scene that one might find in a nature reserve, park, or rural area designated for walking and enjoying the natural environment. The combination of the wooden walkway and the surrounding greenery evokes a sense of tranquility and an opportunity to escape from urban settings to connect with nature.'
    //         },
    //         logprobs: null,
    //         finish_reason: 'stop'
    //     }
    // ]
    // await setUpAndQueryAstraDB(docs, imgUrl);
    // 3. Query Astra vector store and GPT model for a comparison
    await queryAstraAndGPTForArtComparison(imgToCompareUrl);
})();