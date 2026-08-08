import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './layouts/Homepage';
import { TestPage } from './layouts/TestPage';
import { TestPage1 } from './layouts/TestPage1';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/test1" element={<TestPage1 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
