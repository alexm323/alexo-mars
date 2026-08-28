import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PaintNameGenerator from "./pages/PaintNameGenerator";
import DateSurvey from "./pages/DateSurvey";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/paint-names" element={<PaintNameGenerator />} />
        <Route path="/date-survey" element={<DateSurvey />} />
      </Routes>
    </Layout>
  );
}
