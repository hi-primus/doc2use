import json
import os

import openai
from openai.embeddings_utils import get_embedding

openai.api_key = os.getenv("OPENAI_API_KEY")

with open('../../functions.json') as json_file:
    data = json.load(json_file)


def get_embedding(text, engine='text-embedding-ada-002'):
    return get_embedding(text, engine=engine)


# Iterate over each object in the array and add an "e" key with embeddings
for obj in data:
    text = obj['doc']
    embeddings = get_embedding(text)
    obj['e'] = embeddings

# Write the updated JSON data to a file
with open('../../embeddings.json', 'w') as json_file:
    json.dump(data, json_file, indent=4)

# df = pd.DataFrame(all_funcs)
# df['code_embedding'] = df['code'].apply(lambda x: get_embedding(x, engine='text-embedding-ada-002'))
# df['filepath'] = df['filepath'].apply(lambda x: x.replace(code_root, ""))
# df.to_csv("data/code_search_openai-python.csv", index=False)
# df.head()
