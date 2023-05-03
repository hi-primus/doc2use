import * as ts from "typescript";
// Import TensorFlow.js and Universal Sentence Encoder
import "@tensorflow/tfjs-node";
import {loadAndPreprocessResponses} from "./utils";

/**
 * Visit each node recursively and extract the operations
 * @param node
 * @param operationsInfo
 */
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

/**
 * Parse the source code and return a list of operations
 * @param sourceCode
 */
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

/**
 * Load the source code from the URL
 */


const url =
    "https://raw.githubusercontent.com/hi-primus/blurr/main/src/lib/operations/dataframe/cols/index.ts";

const fs = require("fs");

// Load the TS file to be parsed
loadAndPreprocessResponses(url)
    .then(async (sourceCode) => {
        console.log(sourceCode)
        const operationsInfo = parseSourceCode(sourceCode);
        // Load the TS file to be parsed
        // Convert the operations info to the desired format
        const classList = operationsInfo.map((operation) => ({
            doc: operation.docstring,
            fn: operation.functionName,
        }));

        // Write the function list to a JSON file
        fs.writeFileSync("../functions.json", JSON.stringify(classList));

        console.log("Functions list written to functions.json");
    })
    .catch((err) => {
        console.error(`Failed to fetch source code from URL: ${err}`);
    });