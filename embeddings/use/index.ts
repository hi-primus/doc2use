// Import TensorFlow.js and Universal Sentence Encoder
import * as use from "@tensorflow-models/universal-sentence-encoder";
import "@tensorflow/tfjs-node";
import {loadAndPreprocessResponses} from "../../extractions/javascript/utils";



const fs = require("fs");

async function createEmbeddings(responses: { doc: string, fn: string }[], filePath: string, format: string) {

    const model = await use.load();
    const embeddings: { e: number[][], doc: string, fn: string }[] = [];

    for (const response of responses) {

        const input = response.doc + " " + response.fn; // Concatenate doc and fn fields
        const responseEmbedding = await model.embed(input);

        if (format == 'array') {
            const embedding = []
            embedding.push(...responseEmbedding.arraySync() as number[][])

        } else if (format == 'json') {
            const embedding = {
                e: responseEmbedding.arraySync() as number[][],
                doc: response.doc,
                fn: response.fn
            };
            embeddings.push(embedding);
        }
    }

    const data = JSON.stringify(embeddings);
    await fs.promises.writeFile(filePath, data, (err: any) => {
        if (err) throw err;
        console.log(`JSON data written to file ${filePath}`);
    });

    return embeddings;
}


const inputFile = process.argv[2]; // Read the output file argument from the command line
const outputFile = process.argv[3]; // Read the output file argument from the command line
const format = process.argv[4]; // Read the format argument from the command line

if (format !== "array" && format !== "json") {
    console.error("Invalid format. Please specify 'array' or 'json'.");
    process.exit(1); // Exit the process with an error code
}

loadAndPreprocessResponses(inputFile)
    .then(async (sourceCode) => {
        const responses = JSON.parse(sourceCode) as { doc: string; fn: string }[];
        await createEmbeddings(responses, outputFile, format); // Pass the outputFile and format arguments to createEmbeddings
    })
    .catch((err) => {
        console.error(`Failed to fetch source code from URL: ${err}`);
    });


