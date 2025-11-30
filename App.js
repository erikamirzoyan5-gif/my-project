// App.js - ՋՆՋԵՔ HTML IMPORT-Ը ԵՎ ԱՎԵԼԱՑՐԵՔ ROUTES-Ը
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext.jsx";
import "./app.css";
import "./components/regOrg/reg.css";
import Navbar from "./components/Navbar.jsx"; 
import HomePage from "./components/HomePage.jsx"; 
import Whoweare from "./components/Whoweare.jsx"; 
import Footer from "./components/footer.jsx"; 
import Registration from "./components/Registration.jsx";
import Registratioon from './components/registratioon.jsx';
import PlayerRegistration from './components/PlayerRegistration.jsx';
import PlayerReg from './components/PlayerReg.jsx';
import PlayerInterest from './components/PlayerInterest.jsx';
import AccountProfile from './components/AccountProfile.jsx';
import Activities from './components/Activities.jsx';
import Settings from './components/Settings.jsx';

// ✅ Ուղղված import-ները
import Reg from './components/regOrg/Reg.jsx';
import Regnext from './components/regOrg/Regnext.jsx';
import Reeg from './components/regOrg/Reeg.jsx';
import Reeeg from './components/regOrg/Reeeg.jsx';

// ✅ Admin կոմպոնենտները
import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import PendingApprovals from './components/Admin/PendingApprovals.jsx';
import AllUsers from './components/Admin/AllUsers.jsx';
import AdminPrograms from './components/Admin/AdminPrograms.jsx';
import './components/Admin/admin.css';

// ✅ User Dashboard component
import UserDashboard from './components/Dashboard.jsx';

// ✅ Նոր կոմպոնենտներ
import Programs from './components/Programs.jsx';
import Feed from './components/Feed.jsx';


// ✅ Organization components
import OrganizationAccountProfile from './components/OrganizationAccountProfile.jsx';
import OrganizationDashboard from './components/OrganizationDashboard.jsx';
import OrganizationActivities from './components/OrganizationActivities.jsx';
import OrganizationSettings from './components/OrganizationSettings.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/registration" />;
};

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/feed" element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              } />
              <Route path="/whoweare" element={<Whoweare />} />
              <Route path="/registration" element={<Registration/>}/>
              <Route path="/register" element={<Registratioon />} />
              <Route path="/player-registration" element={<PlayerRegistration />} />
              <Route path="/playerReg" element={<PlayerReg />} />
              <Route path="/accountProfile" element={<AccountProfile />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/settings" element={<Settings />} />

              {/* ✅ Navigation Routes */}

              <Route path="/programs" element={<Programs />} />
    

              {/* ✅ Multi-step Registration Routes */}
              <Route path="/Reg" element={<Reg />} />
              <Route path="/Regnext" element={<Regnext />} />
              <Route path="/Reeg" element={<Reeg />} />
              <Route path="/Reeeg" element={<Reeeg />} />

              {/* ✅ User Dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />

              {/* ✅ Admin Routes */}
              <Route path="/admin/dashboard" element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/approvals" element={
                <AdminProtectedRoute>
                  <PendingApprovals />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <AdminProtectedRoute>
                  <AllUsers />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/programs" element={
                <AdminProtectedRoute>
                  <AdminPrograms />
                </AdminProtectedRoute>
              } />

              {/* Authentication routes */}
              <Route path="/player-interests" element={
                <ProtectedRoute>
                  <PlayerInterest />
                </ProtectedRoute>
              } />
              <Route path="/account-profile" element={
                <ProtectedRoute>
                  <AccountProfile />
                </ProtectedRoute>
              } />

              {/* ✅ Organization Routes */}
              <Route path="/organization-account-profile" element={
                <ProtectedRoute>
                  <OrganizationAccountProfile />
                </ProtectedRoute>
              } />
              <Route path="/organization-dashboard" element={
                <ProtectedRoute>
                  <OrganizationDashboard />
                </ProtectedRoute>
              } />
              <Route path="/organization-activities" element={
                <ProtectedRoute>
                  <OrganizationActivities />
                </ProtectedRoute>
              } />
              <Route path="/organization-settings" element={
                <ProtectedRoute>
                  <OrganizationSettings />
                </ProtectedRoute>
              } />
              
              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;