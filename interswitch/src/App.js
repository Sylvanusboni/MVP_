import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthRequest from './getToken';
import Connect from './connection-form';
import PaymentForm from './paymentForm';
import {GoogleOAuthProvider} from '@react-oauth/google';
import PaymentCallback from './Callback';
import TransferPage from './TransferForm';
const ClientId = "304791247255-m04l8nefesgg9uvtfn9mnahlf082ur94.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={ClientId}>
    <Router>
    <Routes>
     <Route path="/" element={< AuthRequest/>} />
      <Route path="/connect" element={< Connect/>} />
      <Route path="/pay" element={< PaymentForm/>} />
      <Route path="/api/interswitch/callback" element={<PaymentCallback />} />
      <Route path="/transfer" element={<TransferPage />} />
    </Routes>
</Router>
</GoogleOAuthProvider>
  );
}

export default App;
