import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './layouts/Homepage';
import { TestPage } from './layouts/TestPage';
import { TestPage1 } from './layouts/TestPage1';
import { Navbar } from './components/Navbar';
import { NotFoundPage } from './layouts/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/test1" element={<TestPage1 />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
