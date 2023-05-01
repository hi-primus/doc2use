import * as fs from "fs";
import * as use from "@tensorflow-models/universal-sentence-encoder";

async function loadEmbeddingsFromFile(filePath: string) {
  const data = await fs.promises.readFile(filePath);
  return JSON.parse(data.toString());
}

async function searchEmbeddings(embeddings: any, query: string) {
  const model = await use.load();
  const queryEmbedding = await model.embed([query]);
  const queryArray = queryEmbedding.arraySync()[0];

  let closestMatch = "";
  let closestDistance = Infinity;

  for (const [key, embedding] of Object.entries(embeddings)) {
    const distance = cosineDistance(queryArray, embedding as number[]);
    // const distance = cosineDistance(queryArray, embedding);
    if (distance < closestDistance) {
      closestMatch = key;
      closestDistance = distance;
    }
  }

  return closestMatch;
}

function cosineDistance(arr1: number[], arr2: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < arr1.length; i++) {
    dotProduct += arr1[i] * arr2[i];
    normA += arr1[i] ** 2;
    normB += arr2[i] ** 2;
  }

  return 1 - dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function main() {
  const embeddings = await loadEmbeddingsFromFile("embeddings.json");
  // const query = prompt("Enter a search query:");
  const query = "convertir a mayusculas"
  const closestMatch = await searchEmbeddings(embeddings, query);
  console.log("Closest match:", closestMatch);
}

main();
