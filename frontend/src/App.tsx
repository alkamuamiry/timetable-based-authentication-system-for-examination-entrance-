import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom"
import { Toaster } from "sonner"

import { AppProvider } from "./component/AppContext"
import ProtectedRoute from "./component/ProtectedRoute"
import DashboardLayout from "./component/DashboardLayout"

import LoginPage from "./pages/LoginPage"
import AdminDashboard from "./pages/AdminDashboard"
import StudentListPage from "./pages/StudentListPage"
import StudentRegPage from "./pages/StudentRegPage"
import StudentEditInfo from "./pages/StudentEditInfo"
import FaceRegisterPage from "./pages/FaceRegisterPage"
import FacialManagementPage from "./pages/FacialManagementPage"
import DevicePage from "./pages/DevicePage"
import DeviceSettingPage from "./pages/DeviceSettingPage"

// Every /admin/* route needs to be logged in (ProtectedRoute) and share
// the same sidebar/navbar chrome (DashboardLayout). Outlet is where
// react-router drops in whichever child route actually matched.
function AdminLayout() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        {/* mounted once, toast.success()/toast.error() calls anywhere
            in the app render here */}
        <Toaster richColors position="top-right" />

        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentListPage />} />
            <Route path="register" element={<StudentRegPage />} />
            <Route path="faceid" element={<FacialManagementPage />} />
            <Route path="student/edit/:id" element={<StudentEditInfo />} />
            <Route path="student/faceupload/:id" element={<FaceRegisterPage />} />
            <Route path="devices" element={<DevicePage />} />
            <Route path="devices/edit/:id" element={<DeviceSettingPage />} />
          </Route>

          {/* anything else (including "/") falls back to login;
              LoginPage itself redirects to /admin if already logged in */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
