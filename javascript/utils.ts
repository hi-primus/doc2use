import * as https from "https";
import * as fs from "fs";


function downloadFileContent(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                let data = "";

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    resolve(data);
                });
            })
            .on("error", (err) => {
                reject(err);
            });
    });
}

async function readFileContent(filePath: string): Promise<string> {
    return await fs.promises.readFile(filePath, "utf-8");
}

export async function loadAndPreprocessResponses(filePath: string) {
    let fileContent: string;
    // Check if the path is a URL or a local file path
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
        // Download the file content from the URL
        fileContent = await downloadFileContent(filePath);
    } else {
        // Read the file content from the local file
        fileContent = await readFileContent(filePath);
    }

    // const responses = JSON.parse(fileContent) as string[];
    return fileContent

}