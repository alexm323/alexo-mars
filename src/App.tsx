import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PaintNameGenerator from "./pages/PaintNameGenerator";

// The old placeholder survey lived at /date-survey before it was replaced
// by the static /mission-debrief.html page. Hard-redirect anyone who still
// has the old URL bookmarked or indexed.
function DateSurveyRedirect() {
  useEffect(() => {
    window.location.replace("/mission-debrief.html");
  }, []);
  return null;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/paint-names" element={<PaintNameGenerator />} />
        <Route path="/date-survey" element={<DateSurveyRedirect />} />
      </Routes>
    </Layout>
  );
}
