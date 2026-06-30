import axios from "axios";

const ai = axios.create({
  baseURL: process.env.AI_URL || "http://localhost:4000/api",
  timeout: 30000,
});

export default ai;