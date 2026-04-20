import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import type { CompositionRoot } from "../application/composition";
import { AppLayout } from "./components/AppLayout";
import { FoodsPage } from "./pages/FoodsPage";
import { HomePage } from "./pages/HomePage";
import { LogsPage } from "./pages/LogsPage";
import { MealsPage } from "./pages/MealsPage.tsx";

interface AppProps {
  composition: CompositionRoot;
}

export function App({ composition }: AppProps) {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage composition={composition} />} />
          <Route
            path="/foods"
            element={<FoodsPage composition={composition} />}
          />
          <Route
            path="/meals"
            element={<MealsPage composition={composition} />}
          />
          <Route
            path="/logs"
            element={<LogsPage composition={composition} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
