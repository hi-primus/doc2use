
## Serialize
Execute :
`protoc --python_out=. serialize.proto`
This will create a file called `serialize_pb2.py` in the current directory.

To serialize the data, check `serialize.ipynb` to output `output.bin`

## Deserialize
Convert .proto file to json
`pbjs -t json serialize.proto -o serialize.json`


