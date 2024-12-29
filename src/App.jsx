import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import ExplorerPage from "./pages/explorer/ExplorerPage";
import HomePage from "./pages/home/HomePage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>
      <Route path="explorer" element={<ExplorerPage />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
    },
  }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
