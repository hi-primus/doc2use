import argparse
import ast
import json

import astunparse
import requests

INIT_FILE_PATH = 'files.txt'


def extract_function_defs(file_paths=None):
    """
    Extracts function definitions from the given file paths and saves them to a JSON file.
    :param file_paths:
    :return: JSON file containing the function definitions
    """
    class_list = []

    with open(file_paths, 'r') as file:
        file_paths = file.readlines()

    for path in file_paths:
        path = path.strip()
        # Check if the path is a URL or a local file path
        if path.startswith("http://") or path.startswith("https://"):
            # Download the file content from the URL
            response = requests.get(path)
            text = response.content.decode("utf-8")
        else:
            # Read the file content from the local file
            with open(path, "r") as file:
                text = file.read()

        # Parse the code and extract the function definitions
        p = ast.parse(text)
        for node in ast.walk(p):
            if isinstance(node, ast.ClassDef):
                for child_node in node.body:
                    if isinstance(child_node, ast.FunctionDef):
                        #  if node name starts with __ we skip it
                        if child_node.name.startswith("_"):
                            continue

                        # Get the function arguments
                        args = child_node.args
                        arg_names = [arg.arg for arg in args.args]
                        defaults = [astunparse.unparse(default).strip() if default else None for default in
                                    args.defaults]
                        default_values = [f"{name}={value}" if value else name for name, value in
                                          zip(arg_names[len(arg_names) - len(defaults):], defaults)]

                        # Get the function's docstring, if it has one
                        docstring = ast.get_docstring(child_node) or ""

                        # Construct the function definition string with docstring
                        func_def_str = f'def {child_node.name}({", ".join([f"{name}={value}" if value else name for name, value in zip(arg_names, default_values)])}):'

                        # Append the constructed function definition string to classList
                        class_list.append({"doc": docstring, "fn": func_def_str})

    # Write the extracted function definitions to a JSON file
    with open("../functions.json", "w") as file:
        json.dump(class_list, file)

    return class_list


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', type=str, help='URL to download file from')
    parser.add_argument('--file', type=str, help='Name of file to with a list of urls to be downloaded')
    args = parser.parse_args()

    # Extract the function definitions
    extract_function_defs(args.file or args.url)

# extract_function_defs(file_paths)
# #%%
# import tensorflow as tf
# import tensorflow_hub as hub
# import json
#
# # Load the Universal Sentence Encoder module
# module_url = "https://tfhub.dev/google/universal-sentence-encoder-lite/2"
# embed = hub.load(module_url)
#
# # Define a list of instructions
# instructions = ["Open the door", "Turn on the lights", "Close the window"]
#
# # Encode the instructions using the Universal Sentence Encoder
# embeddings = embed(instructions)
#
# # Convert the embeddings to a list
# embeddings = [embedding.tolist() for embedding in embeddings]
#
# # # Save the embeddings to a JSON file
# # with open("embeddings.json", "w") as f:
# #     json.dump(embeddings, f)
