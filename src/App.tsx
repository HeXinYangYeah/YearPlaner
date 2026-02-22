import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Report from './pages/Report';
import StickyProgressBar from './components/StickyProgressBar';
import RookieTutorial from './components/RookieTutorial';

function App() {
  return (
    <div className="min-h-screen font-sans cursor-default pb-20">
      <RookieTutorial />
      <StickyProgressBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </div>
  );
}

export default App;
