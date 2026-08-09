import React from 'react'
import isAuthenticated from '../api/axios'
import { Navigate } from 'react-router-dom'
const ProtectedRoute = ({children}:{children:React.ReactNode}) => {
    if(!isAuthenticated()){
        return <Navigate to="/login" replace/>
    }
        return children
  
}

export default ProtectedRoute
