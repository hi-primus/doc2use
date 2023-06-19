## Serialize

You can find protoc here https://github.com/protocolbuffers/protobuf/releases/tag/v23.3

Execute :
`protoc --python_out=. serialize.proto`
This will create a file called `serialize_pb2.py` in the current directory.

To serialize the data, run:
```
python .\serialize.py --file ..\embeddings.json --output output.bin
```

