import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { CreditCards } from './pages/CreditCards';
import { Investments } from './pages/Investments';
import { Accounts } from './pages/Accounts';
import { Settings } from './pages/Settings';
import { Loans } from './pages/Loans';
import { Snapshots } from './pages/Snapshots';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="credit-cards" element={<CreditCards />} />
          <Route path="investments" element={<Investments />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="loans" element={<Loans />} />
          <Route path="snapshots" element={<Snapshots />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
