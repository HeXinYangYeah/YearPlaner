import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Report from './pages/Report';
import RookieTutorial from './components/RookieTutorial';
import WelcomeGate from './components/WelcomeGate';

function App() {
  return (
    <div className="min-h-screen font-sans cursor-default pb-20">
      <RookieTutorial />
      <Routes>
        <Route path="/" element={<WelcomeGate />} />
        <Route path="/plan" element={<Home />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </div>
  );
}

export default App;
