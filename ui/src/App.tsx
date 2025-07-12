import { Routes, Route, BrowserRouter } from "react-router-dom";
import { PrivateRoute } from "./lib/private-routes";
import Landing from "./pages/landing";
import Layout from "./components/layout";
import NotFound from "./pages/not-found";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Gallery from "./pages/gallery";
import Video from "./pages/video";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/video/:postID" element={<Video />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
