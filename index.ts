import * as ts from "typescript";
import * as https from "https";
// Import TensorFlow.js and Universal Sentence Encoder
import * as use from "@tensorflow-models/universal-sentence-encoder";
import "@tensorflow/tfjs-node"; // For CPU

function visit(node: ts.Node, operationsInfo: any[]) {
  if (
    ts.isCallExpression(node) &&
    node.expression.getText() === "DataframeOperation"
  ) {
    const grandParentNode = node.parent.parent;
    const leadingCommentRanges = ts.getLeadingCommentRanges(
      grandParentNode.getSourceFile().text,
      grandParentNode.pos
    );
    const docstring = leadingCommentRanges
      ? leadingCommentRanges
          .filter(
            (range) => range.kind === ts.SyntaxKind.MultiLineCommentTrivia
          )
          .map((range) =>
            grandParentNode
              .getSourceFile()
              .text.substring(range.pos + 2, range.end - 2)
          )
          .join("\n")
      : "";

    const objLitExp = node.arguments[0];
    if (ts.isObjectLiteralExpression(objLitExp)) {
      const funcNameNode = objLitExp.properties.find(
        (prop) => prop.name && prop.name.getText() === "name"
      );
      const funcParamsNode = objLitExp.properties.find(
        (prop) => prop.name && prop.name.getText() === "args"
      );
      if (
        funcNameNode &&
        ts.isPropertyAssignment(funcNameNode) &&
        ts.isStringLiteral(funcNameNode.initializer)
      ) {
        const funcName = funcNameNode.initializer.text;

        if (
          funcParamsNode &&
          ts.isPropertyAssignment(funcParamsNode) &&
          ts.isArrayLiteralExpression(funcParamsNode.initializer)
        ) {
          const funcParams = funcParamsNode.initializer.elements.map(
            (element) => {
              if (ts.isObjectLiteralExpression(element)) {
                const param: any = {};
                element.properties.forEach((property) => {
                  if (ts.isPropertyAssignment(property)) {
                    const key = property.name.getText();
                    const value = property.initializer.getText();
                    param[key] = value;
                  }
                });
                return param;
              }
            }
          );

          const funcParamsString = funcParams
            .map((param) => {
              const paramName = param["name"];
              const paramValue =
                param["default"] || param["required"]
                  ? param["default"]
                  : "undefined";
              return `${paramName}: ${paramValue}`;
            })
            .join(", ");

          const funcSignature = `${funcName}({${funcParamsString}})`;

          operationsInfo.push({
            functionName: funcSignature,
            docstring: docstring,
          });
        }
      }
    }
  }

  ts.forEachChild(node, (child) => visit(child, operationsInfo));
}

function parseSourceCode(sourceCode: string) {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    sourceCode,
    ts.ScriptTarget.ES2015,
    true
  );

  const operationsInfo: any[] = [];

  visit(sourceFile, operationsInfo);

  return operationsInfo;
}

// Load the source code from the URL
function fetchSourceCode(url: string): Promise<string> {
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

const url =
  "https://raw.githubusercontent.com/hi-primus/blurr/main/src/lib/operations/dataframe/cols/index.ts";

const fs = require("fs");

async function preprocessResponses(responses: string[], filePath: string) {
  const model = await use.load();
  const cachedResponseEmbeddings: { [key: string]: number[][] } = {};

  for (const response of responses) {
    const responseEmbedding = await model.embed(response);
      cachedResponseEmbeddings[response] = responseEmbedding.arraySync() as number[][];
  }
  const data = JSON.stringify(cachedResponseEmbeddings);
  await fs.promises.writeFile(filePath, data, (err: any) => {
    if (err) throw err;
    console.log(`JSON data written to file ${filePath}`);
  });
}

// Load the TS file to be parsed
fetchSourceCode(url)
  .then(async (sourceCode) => {
    const operationsInfo = parseSourceCode(sourceCode);
    // Create a list of function names
    const functionNames = operationsInfo.map(
      (operationInfo) => operationInfo.functionName
    );
    // Process the list of functions names
    const embeddings = await preprocessResponses(
      functionNames,
      "embeddings.json"
    );
    console.log(embeddings);
  })
  .catch((err) => {
    console.error(`Failed to fetch source code from URL: ${err}`);
  });
