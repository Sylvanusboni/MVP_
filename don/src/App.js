import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './view/connectionForm';
import Dashboard from './view/dashboard';
import DonateForm from './view/components/donnateForm';
import PaymentCallback from './view/Callback';

function App() {
  return (
    <Router>
    <Routes>
    <Route path="/" element={< AuthPage/>} />
    <Route path="/dashboard" element={< Dashboard/>} />
    <Route path="/dons" element={< Dashboard/>} />
    <Route path="/cotisations" element={< Dashboard/>} />
    <Route path="/tontines" element={< Dashboard/>} />
    <Route path="/donate/:campaignId" element={<DonateForm />} />
    <Route path="/api/interswitch/callback" element={<PaymentCallback />} />
    </Routes>
</Router>
  );
}

export default App;