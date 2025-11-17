// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '../stores';
// import LoginModal from '../components/LoginModal';

// function Login() {
//   const navigate = useNavigate();
//   const { isAuthenticated, checkAuthStatus, isLoading } = useAuthStore();
//   const [open, setOpen] = useState(true);

//   // 로그인 상태 체크
//   useEffect(() => {
//     checkAuthStatus();
//   }, [checkAuthStatus]);

//   // 이미 로그인 되어 있으면 홈으로 이동
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/');
//     }
//   }, [isAuthenticated, navigate]);

//   // 로딩 표시
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p>로그인 상태 확인 중...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       {open && <LoginModal onClose={() => navigate('/')} />}
//     </div>
//   );
// }

// export default Login;
