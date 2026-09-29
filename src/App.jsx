import { Route, Routes } from "react-router-dom";
import { Chapter } from "./components/Chapter";
import { Home } from "./components/Home";
import { Shell } from "./components/Shell";
import { TipProvider } from "./components/Tips";

export function App() {
  return (
    <TipProvider>
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/read/:slug" element={<Chapter />} />
        <Route
          path="*"
          element={
            <div className="wrap missing">
              <h1>That page is not in the series.</h1>
              <a href="/">Back to the beginning</a>
            </div>
          }
        />
      </Routes>
    </Shell>
    </TipProvider>
  );
}
