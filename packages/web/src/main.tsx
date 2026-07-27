import React from "react";
import ReactDOM from "react-dom/client";

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-heading text-ocean-300">四叶草蓝星球</h1>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
