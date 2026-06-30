import brain from "brain.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_PATH = path.join(
  __dirname,
  "../../saved-models/stok.json"
);

function createNet() {
  return new brain.NeuralNetwork({
    hiddenLayers: [8, 4],
    activation: "sigmoid",
    learningRate: 0.01,
  });
}

export function trainStok(trainingData, options = {}) {
  const net = createNet();

  const result = net.train(trainingData, {
    iterations: 5000,
    errorThresh: 0.005,
    log: true,
    logPeriod: 500,
    ...options,
  });

  fs.writeFileSync(MODEL_PATH, JSON.stringify(net.toJSON()));

  console.log("[stok] Training selesai:", result);

  return net;
}

export function predictStok(inputNormalized) {
  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(
      "Model stok belum ditraining. Jalankan: pnpm run train"
    );
  }

  const net = createNet();

  net.fromJSON(
    JSON.parse(fs.readFileSync(MODEL_PATH, "utf-8"))
  );

  return net.run(inputNormalized);
}