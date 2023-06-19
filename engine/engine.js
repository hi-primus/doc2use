class Engine {
    async embedding(file) {

    }

    async createEmbeddings({token, model, input}) {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            method: 'POST',
            body: JSON.stringify({input, model}),
        });

        const {error, data, usage} = await response.json();

        return data;
    };

    async query(query) {
        const vector = await this.createEmbeddings({
            token: '[OPENAI_API_TOKEN]',
            model: 'text-embedding-ada-002',
            input: query,
        });
    }

    async loadBinaryFile(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error loading ${url}: ${response.statusText}`);
        return new Uint8Array(await response.arrayBuffer());
    }

    async constructor(dbData, deserializedFile) {
        this.dbData = dbData;
        this.deserializedFile = deserializedFile;

        // Load the protobuf definition from the JSON file
        const root = await protobuf.load(this.deserializedFile);
        const Data = root.lookupType('Data');

        // Read the binary data from the 'output.bin' file
        const binaryData = await this.loadBinaryFile(this.dbData);

        // Deserialize the binary data into a protobuf message
        const deserializedMessage = Data.decode(binaryData);

        if (!("gpu" in navigator)) {
            console.log(
                "WebGPU is not supported. Enable chrome://flags/#enable-unsafe-webgpu flag."
            );
            return;
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            console.log("Failed to get GPU adapter.");
            return;
        }
        const device = await adapter.requestDevice();

    }

    // Method: deserialize
    // Purpose: deserialize the file
    deserialize() {
        this.deserializedFile = JSON.parse(this.dbData);
    }

    // Method: serialize
    // Purpose: serialize the file
    serialize() {
        this.dbData = JSON.stringify(this.deserializedFile);
    }


}