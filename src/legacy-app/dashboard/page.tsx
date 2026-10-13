import React from 'react'

import DashboardRoute from './DashboardRoute/page'
import AuthGuard from '@/guard/AuthGuard'

const page = () => {
  return (
    <AuthGuard>
     <DashboardRoute/>
    </AuthGuard>
  )
}

export default page



// // src/app/(protected)/dashboard/page.tsx
// import AuthGuard from '@/guard/AuthGuard'

// export default function page() {
//   return (
//     <AuthGuard>
//       <div>Dashboard Content</div>
//     </AuthGuard>
//   )
// }


// // src/app/(auth)/login/page.tsx
// import GuestGuard from '@/guard/GuestGuard'

// export default function LoginPage() {
//   return (
//     <GuestGuard>
//       <div>Login Form</div>
//     </GuestGuard>
//   )
// }

