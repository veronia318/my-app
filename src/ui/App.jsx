// // import React, { useState, useEffect } from "react";
// // import {
// //   BrowserRouter as Router,
// //   Routes,
// //   Route,
// //   Navigate,
// // } from "react-router-dom";
// // import "../ui/styles/App.css";
// // import LiveReadings from "./pages/LiveReadings";
// // import Login from "./pages/login";
// // import RegisterForm from "./pages/RegisterForm";
// // import Navbar from "./components/Navbar";
// // import RoomsPage from "./pages/RoomsPage";
// // import LoadingPage from "./pages/loading";
// // import HomePage from "./pages/Homepage";
// // import RoomDetails from "./pages/RoomDetails";
// // import { AuthProvider } from "../application/auth/AuthContext";
// // import ProtectedRoute from "../application/routing/ProtectedRoute";
// // import UserProfile from "./pages/UserProfile";
// // import AIAnalysis from "./pages/AIAnalysis";
// // import Scheduling from "./pages/Scheduling";

// // function App() {
// //   const [isLoading, setIsLoading] = useState(true);

// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       setIsLoading(false);
// //     }, 3000);
// //     return () => clearTimeout(timer);
// //   }, []);

// //   if (isLoading) {
// //     return <LoadingPage />;
// //   }

// //   return (
// //     <AuthProvider>
// //       <Router>
// //         <div className="App">
// //           <Navbar />
// //           <Routes>
// //             <Route path="/login" element={<Login />} />
// //             <Route path="/register" element={<RegisterForm />} />

// //             <Route
// //               path="/"
// //               element={
// //                 <ProtectedRoute>
// //                   <HomePage />
// //                 </ProtectedRoute>
// //               }
// //             />
// //             <Route
// //               path="/profile"
// //               element={
// //                 <ProtectedRoute>
// //                   <UserProfile />
// //                 </ProtectedRoute>
// //               }
// //             />
// //             <Route
// //               path="/live-readings"
// //               element={
// //                 <ProtectedRoute>
// //                   <LiveReadings />
// //                 </ProtectedRoute>
// //               }
// //             />
// //             <Route
// //               path="/rooms"
// //               element={
// //                 <ProtectedRoute>
// //                   <RoomsPage />
// //                 </ProtectedRoute>
// //               }
// //             />
// //             <Route
// //               path="/rooms/:roomId"
// //               element={
// //                 <ProtectedRoute>
// //                   <RoomDetails />
// //                 </ProtectedRoute>
// //               }
// //             />

// //             <Route path="*" element={<Navigate to="/login" replace />} />
// //             <Route path="/ai-analysis" element={<AIAnalysis />} />
// //             <Route path="/scheduling" element={<Scheduling />} />
// //           </Routes>
// //         </div>
// //       </Router>
// //     </AuthProvider>
// //   );
// // }

// // export default App;

// import React, { useState, useEffect } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import "../ui/styles/App.css";
// import LiveReadings from "./pages/LiveReadings";
// import Login from "./pages/login";
// import RegisterForm from "./pages/RegisterForm";
// import Navbar from "./components/Navbar";
// import RoomsPage from "./pages/RoomsPage";
// import LoadingPage from "./pages/loading";
// import HomePage from "./pages/Homepage";
// import RoomDetails from "./pages/RoomDetails";
// import { AuthProvider } from "../application/auth/AuthContext";
// import ProtectedRoute from "../application/routing/ProtectedRoute";
// import UserProfile from "./pages/UserProfile";
// import AIAnalysis from "./pages/AIAnalysis";
// import Scheduling from "./pages/Scheduling";

// function App() {
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//     }, 3000);
//     return () => clearTimeout(timer);
//   }, []);

//   if (isLoading) {
//     return <LoadingPage />;
//   }

//   return (
//     <AuthProvider>
//       <Router>
//         <div className="App">
//           <Navbar />
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<RegisterForm />} />

//             <Route
//               path="/"
//               element={
//                 <ProtectedRoute>
//                   <HomePage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/profile"
//               element={
//                 <ProtectedRoute>
//                   <UserProfile />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/live-readings"
//               element={
//                 <ProtectedRoute>
//                   <LiveReadings />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/rooms"
//               element={
//                 <ProtectedRoute>
//                   <RoomsPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/rooms/:roomId"
//               element={
//                 <ProtectedRoute>
//                   <RoomDetails />
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/ai-analysis"
//               element={
//                 <ProtectedRoute>
//                   <AIAnalysis />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/scheduling"
//               element={
//                 <ProtectedRoute>
//                   <Scheduling />
//                 </ProtectedRoute>
//               }
//             />

//             <Route path="*" element={<Navigate to="/login" replace />} />
//           </Routes>
//         </div>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "../ui/styles/App.css";
import LiveReadings from "./pages/LiveReadings";
import Login from "./pages/login";
import RegisterForm from "./pages/RegisterForm";
import Navbar from "./components/Navbar";
import RoomsPage from "./pages/RoomsPage";
import LoadingPage from "./pages/loading";
import HomePage from "./pages/Homepage";
import RoomDetails from "./pages/RoomDetails";
import { AuthProvider } from "../application/auth/AuthContext";
import { ThemeProvider } from "../application/theme/ThemeContext";
import ProtectedRoute from "../application/routing/ProtectedRoute";
import UserProfile from "./pages/UserProfile";
import AIAnalysis from "./pages/AIAnalysis";
import Scheduling from "./pages/Scheduling";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ThemeProvider>
        <LoadingPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterForm />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/live-readings"
                element={
                  <ProtectedRoute>
                    <LiveReadings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rooms"
                element={
                  <ProtectedRoute>
                    <RoomsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rooms/:roomId"
                element={
                  <ProtectedRoute>
                    <RoomDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ai-analysis"
                element={
                  <ProtectedRoute>
                    <AIAnalysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scheduling"
                element={
                  <ProtectedRoute>
                    <Scheduling />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
