import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Batches from './pages/admin/Batches';
import Subjects from './pages/admin/Subjects';
import Units from './pages/admin/Units';
import Materials from './pages/admin/Materials';
import Videos from './pages/admin/Videos';
import Students from './pages/admin/Students';

import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import SubjectDetail from './pages/student/SubjectDetail';
import UnitDetail from './pages/student/UnitDetail';

const PendingApproval = () => <div className="p-10 text-center">Your account is pending admin approval. Please check back later.</div>;

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Root Redirect based on Auth (Could be handled inside a standalone component, but keeping it simple) */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="batches" element={<Batches />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="units" element={<Units />} />
          <Route path="materials" element={<Materials />} />
          <Route path="videos" element={<Videos />} />
          <Route path="students" element={<Students />} />
        </Route>
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRole="student" />}>
        {/* We can check approval status inside the StudentLayout or individual pages */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="subject/:subjectId" element={<SubjectDetail />} />
          <Route path="unit/:unitId" element={<UnitDetail />} />
          <Route path="pending" element={<PendingApproval />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
