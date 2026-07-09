import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Remove stale seed data written by a dev-only seedValdivia() call that has
// since been removed. The key used locode "CL LD" which was never a real city.
localStorage.removeItem("hiap:CL LD:results");
localStorage.removeItem("hiap:CL LD:regulations");
localStorage.removeItem("hiap:CL LD:strategic:form");

createRoot(document.getElementById("root")!).render(<App />);
