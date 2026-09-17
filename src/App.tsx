import { lazy, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout";
import StartupGate from "./components/StartupGate";
import ExperienceShell from "./components/ExperienceShell";
import RenderMotionProvider from "./components/RenderMotionProvider";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const NeighborhoodsIndex = lazy(() => import("./pages/NeighborhoodsIndex"));
const NeighborhoodPage = lazy(() => import("./pages/NeighborhoodPage"));
const Listings = lazy(() => import("./pages/Listings"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const Sell = lazy(() => import("./pages/Sell"));
const Buy = lazy(() => import("./pages/Buy"));
const Contact = lazy(() => import("./pages/Contact"));
const Thanks = lazy(() => import("./pages/Thanks"));

function NotFound() {
  return (
    <section className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-44 text-center">
      <p className="eyebrow mb-4">404</p>
      <h1 className="text-3xl font-medium">That page isn't on the map.</h1>
      <Link to="/" className="btn-plum mt-8 inline-flex px-6 py-3 text-sm">
        Back to the island
      </Link>
    </section>
  );
}

export default function App() {
  return (
    <ExperienceShell>
      <RenderMotionProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/neighborhoods" element={<NeighborhoodsIndex />} />
              <Route path="/neighborhoods/:slug" element={<NeighborhoodPage />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/buy" element={<Buy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/thanks" element={<Thanks />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
        <StartupGate />
      </RenderMotionProvider>
    </ExperienceShell>
  );
}
