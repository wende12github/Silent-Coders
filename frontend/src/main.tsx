<<<<<<< HEAD
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Leaderboard from "./Components/Leaderboard.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
=======
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

/*
Things I have changes inorder to code with jsx instead of tsx 
-change the extension of App,main.tsx to jsx
-adjust the extension jsx in the main.jsx file to avoid inconsistency 
 also i changed :   
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,  to 
non ! delete (!) symbol.
)
-adjust index.html main.txs to main.jsx

 */
>>>>>>> aabb6135a19ce77609e0fcbbd66bb6efff8fddec
