// Import TensorFlow.js and Universal Sentence Encoder
import * as use from "@tensorflow-models/universal-sentence-encoder";
import "@tensorflow/tfjs-node";
import {loadAndPreprocessResponses} from "./javascript/utils"; // For CPU


const fs = require("fs");
async function parseSourceCode(responses: { doc: string, fn: string }[], filePath: string) {

    const model = await use.load();
    const embeddings: { e: number[][], doc: string, fn: string }[] = [];

    for (const response of responses) {

        const input = response.doc + " " + response.fn; // Concatenate doc and fn fields
        const responseEmbedding = await model.embed(input);
        const embedding = {
            e: responseEmbedding.arraySync() as number[][],
            doc: response.doc,
            fn: response.fn
        };
        embeddings.push(embedding);
    }

    const data = JSON.stringify(embeddings);
    await fs.promises.writeFile(filePath, data, (err: any) => {
        if (err) throw err;
        console.log(`JSON data written to file ${filePath}`);
    });

    return embeddings;
}

const url = "functions.json"

loadAndPreprocessResponses(url)
    .then(async (sourceCode) => {
        const responses = JSON.parse(sourceCode) as { doc: string, fn: string }[];
        await parseSourceCode(responses, "embeddings.json");
    })
    .catch((err) => {
        console.error(`Failed to fetch source code from URL: ${err}`);
    });

