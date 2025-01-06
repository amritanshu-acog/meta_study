import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ExplorerPage from "./pages/explorer/ExplorerPage";
import HomePage from "./pages/home/HomePage";
import AboutPage from "./pages/about/AboutPage";
import AllStudiesPage from "./pages/studies/AllStudiesPage";
import StudyDetail from "./components/study/single-study/StudyDetail";
import Observations from "./components/study/single-study/Observations";
import ObservationDetail from "./components/study/single-study/ObservationDetail";
import StudyNodeSummary from "./components/study/single-study/StudyNodeSummary";
import StudyLayout from "./layouts/StudyLayout";
import AllStudiesPageMulti from "./components/multistudy/pool/Multi";
import StudyPoolPage from "./components/multistudy/pool/StudyPoolPage";
import { DndProvider } from "react-dnd"; // Import DndProvider
import { HTML5Backend } from "react-dnd-html5-backend"; // Import HTML5Backend
import { MappingProvider } from './components/multistudy/pool/MappingContext'; // Adjust the import path as necessary
import ExplorerPageMulti from "./components/multistudy/Multi_Explorer/pages/explorer/ExplorerPageMulti";


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/all-studies" element={<AllStudiesPage />} />

        {/* ADD ROUTE FOR OBSERVATIONS */}
        <Route
          path="/study/:studyId/observations/:nodeId/observation/:observationId"
          element={<ObservationDetail />}
        />
      </Route>
      {/* ROUTE FOR STUDY DETAIL */}
      <Route path="/study/:studyId" element={<StudyLayout />}>
        <Route index element={<StudyDetail />} />
        <Route path="summary/:nodeId" element={<StudyNodeSummary />} />
        <Route path="observations/:nodeId" element={<Observations />} />
      </Route>
      <Route path="/multistudy" element={<AllStudiesPageMulti />} />
      <Route path="/multistudy/studypool" element={<StudyPoolPage />} />
      <Route
          path="/multistudy/explorer"
          element={<Navigate to="/multistudy/d344c323-31ac-4c45-b932-096f3cbb238d/explorer" />}
        />
        <Route path="/multistudy/:metastudyId/explorer" element={<ExplorerPageMulti />} />
      <Route
        path="/study/:studyId/explorer/:nodeId"
        element={<ExplorerPage />}
      />
    </Route>
  )
);

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <MappingProvider>
        <RouterProvider router={router} />
      </MappingProvider>
    </DndProvider>
  );
}

export default App;
