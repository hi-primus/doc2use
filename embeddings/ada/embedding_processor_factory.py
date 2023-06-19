import json
import os

import openai
import requests
from dotenv import load_dotenv
from openai.embeddings_utils import get_embedding
from tqdm import tqdm

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


class EmbeddingProvider:
    def get_embedding(self, text):
        raise NotImplementedError()


class TextEmbeddingAdaProvider(EmbeddingProvider):
    def __init__(self):
        self.engine = "text-embedding-ada-002"
        self.length = 1536

    def get_embedding(self, text):
        return get_embedding(text, engine=self.engine)


class TextEmbeddingInstructProvider(EmbeddingProvider):
    def __init__(self):
        self.engine = "text-embedding-ada-002"
        self.length = 1536

    def get_embedding(self, text):
        return get_embedding(text, engine="text-embedding-ada-002")


class EmbeddingProcessor:
    def __init__(self, save_file_path, data_source):
        self.save_file_path = save_file_path
        self.data_source = data_source
        self.data = []

    def load_data(self):
        if self.data_source.startswith('http'):
            response = requests.get(self.data_source)
            self.data = response.json()
        else:
            with open(self.data_source, 'r') as file:
                self.data = json.load(file)

    def process_data(self):
        raise NotImplementedError()

    def save_data(self, data):
        with open(self.save_file_path, 'w') as json_file:
            json.dump(data, json_file, indent=4)


class JSONEmbeddingProcessor(EmbeddingProcessor):
    def process_data(self):
        self.load_data()

        for obj in tqdm(self.data):
            text = obj['fn'] + "-" + obj['doc']
            if text:
                embeddings = self.embedding_provider.get_embedding(text)
                obj['e'] = embeddings

        self.save_data(self.data)


class ArrayEmbeddingProcessor(EmbeddingProcessor):
    def process_data(self):
        self.load_data()

        result = {'embed': [], 'doc': [], 'name': [], 'fn': []}
        for obj in tqdm(self.data):
            text = obj['fn'] + "-" + obj['doc']
            if text:
                embeddings = self.embedding_provider.get_embedding(text)
                result["embed"].extend(embeddings)
                result["doc"].append(obj['doc'])
                result["name"].append(obj['name'])
                result["fn"].append(obj['fn'])

        self.save_data(result)


class EmbeddingProcessorFactory:
    @staticmethod
    def create_embedding_processor(data_source, output_path, format="array"):
        if not data_source:
            raise ValueError("Data source is required")
        if not output_path:
            raise ValueError("Output path is required")

        embedding_provider = TextEmbeddingAdaProvider()
        if format == "json":
            processor = JSONEmbeddingProcessor(output_path, data_source)
        elif format == "array":
            processor = ArrayEmbeddingProcessor(output_path, data_source)
        else:
            raise ValueError("Unsupported format")

        processor.embedding_provider = embedding_provider
        return processor
