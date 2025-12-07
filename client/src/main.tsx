import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Debug logging for deployment
console.log("Mounting React App...");
console.log("Base URL:", import.meta.env.BASE_URL);
console.log("Mode:", import.meta.env.MODE);

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Failed to find root element");
} else {
  try {
    createRoot(rootElement).render(<App />);
    console.log("React App mounted successfully");
  } catch (error) {
    console.error("Failed to mount React App:", error);
  }
}

