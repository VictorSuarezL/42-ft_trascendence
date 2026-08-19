import { BrowserRouter, Route, Routes } from 'react-router-dom';
import styles from './App.module.scss';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { HomePage } from './pages/HomePage';
import { UserProvider } from './contexts/UserContext';
import { ProfilePage } from './pages/ProfilePage';
import { ProtectedRoute } from './components/ProtectedRoutes';
import { SignUpPage } from './pages/SignUpPage';
import { SignUpConfirmation } from './pages/SignUpConfirmation';
import { GuestRoute } from './components/GuestRoute';
import { ComoJugar } from './pages/ComoJugar';

function App() {
  return (
    <UserProvider>
      <main>
        <BrowserRouter>
          <div className={styles.app}>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route
                  path="/signup-confirmation"
                  element={<SignUpConfirmation />}
                />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/comojugar" element={<ComoJugar />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </main>
    </UserProvider>
  );
}

export default App;
