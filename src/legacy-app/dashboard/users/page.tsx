// src/components/UserList.tsx
'use client'

import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks/hooks'
import { getAllUsers } from '@/redux/features/user/userThunks'
import UserTable from '@/core/dashboard/layout/userTable/UserTable'
import UserList from '@/core/dashboard/layout/userList/UserList'


const User = () => {

  
  return <UserList  />
}

export default User
