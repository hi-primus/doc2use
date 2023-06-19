import argparse

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', type=str, help='URL to download a file from')
    parser.add_argument('--file', type=str, help='Name of file with a list of urls to be downloaded')
    parser.add_argument('--output', type=str, default='functions.json', help='Output file name')

    args = parser.parse_args()

    from embedding_processor_factory import EmbeddingProcessorFactory

    processor = EmbeddingProcessorFactory.create_embedding_processor(args.file, args.output, "array")
    processor.process_data()
