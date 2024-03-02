import React from "react";
import "./App.css";
import { Input } from "./components/Input";
import { OutputLines } from "./components/OutputLines";
import { AppContextProvider } from "./store/app.context";

function App() {
  return (
    <AppContextProvider>
      <div className="App">
        <OutputLines />
        <Input />
      </div>
    </AppContextProvider>
  );
}

export default App;
