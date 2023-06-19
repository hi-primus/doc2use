struct Matrix {
  size : vec2<f32>,
  numbers: array<f32>,
}

@group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
@group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
@group(0) @binding(2) var<storage, read_write> resultMatrix : Matrix;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  // Guard against out-of-bounds work group sizes
  if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.x)) {
    return;
  }

  resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.x);

  let rowA = global_id.x;
  let rowB = global_id.y;
  var dotProduct = 0.0;
  var normA = 0.0;
  var normB = 0.0;

  for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
    let a = i + rowA * u32(firstMatrix.size.y);
    let b = i + rowB * u32(secondMatrix.size.y);
    dotProduct = dotProduct + firstMatrix.numbers[a] * secondMatrix.numbers[b];
    normA = normA + firstMatrix.numbers[a] * firstMatrix.numbers[a];
    normB = normB + secondMatrix.numbers[b] * secondMatrix.numbers[b];
  }

  normA = sqrt(normA);
  normB = sqrt(normB);
  let cosineSimilarity = dotProduct / (normA * normB);

  let index = rowB + rowA * u32(secondMatrix.size.x);
  resultMatrix.numbers[index] = cosineSimilarity;
}
`
