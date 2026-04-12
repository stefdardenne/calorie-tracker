import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import type { CompositionRoot } from "../application/composition";
import { AppLayout } from "./components/AppLayout";
import { FoodsPage } from "./pages/FoodsPage";
import { HomePage } from "./pages/HomePage";
import { MealsPage } from "./pages/MealsPage.tsx";

interface AppProps {
  composition: CompositionRoot;
}

export function App({ composition }: AppProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/foods"
            element={<FoodsPage composition={composition} />}
          />
          <Route
            path="/meals"
            element={<MealsPage composition={composition} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
