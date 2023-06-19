import argparse
import json

import serialize_pb2

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', type=str, help='URL to download a file from')
    parser.add_argument('--file', type=str, help='Name of file with a list of urls to be downloaded')
    parser.add_argument('--output', type=str, default='functions.json', help='Output file name')

    args = parser.parse_args()

    # Read JSON data
    with open(args.file, 'r') as f:
        json_data = json.load(f)

    # Create a protobuf message
    data_message = serialize_pb2.Data()
    # Populate the protobuf message with the JSON data
    data_message.embed.extend(json_data["embed"])
    data_message.fn.extend(json_data["fn"])
    data_message.name.extend(json_data["name"])
    data_message.doc.extend(json_data["doc"])

    # Serialize the protobuf message to a binary format
    serialized_data = data_message.SerializeToString()

    # Save the serialized data to a file
    with open(args.output, "wb") as output_file:
        output_file.write(serialized_data)
