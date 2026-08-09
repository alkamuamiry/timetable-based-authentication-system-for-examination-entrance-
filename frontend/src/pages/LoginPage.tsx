import React from 'react'
import facialImage from '../../src/assets/iconImage/logo-png-png.png'
import loadingGif from '../../src/assets/iconImage/scanner.gif'
import api from '../api/axios'
import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect,useState } from 'react'
const Login =  () => {
  const [loading, setLoading] = useState(false)
  const [emailError,setEmailError] = useState<string>("")
  const [passwordError,setPasswordError] = useState<string>("")
  const [generalError,setGeneralerror] = useState<string>("")
  const navigate = useNavigate()


async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault()

  setLoading(true)

  const formData = new FormData(e.currentTarget)
  const data = Object.fromEntries(formData.entries())

  let hasError = false

  // validation
  if (!data?.email) {
    setEmailError("Email is required")
    hasError = true
  } else {
    setEmailError("")
  }

  if (!data?.password) {
    setPasswordError("Password is required")
    hasError = true
  } else {
    setPasswordError("")
  }

  if (hasError) {
    setLoading(false)
    return
  }

  try {
    const response = await api.post('/login/', data)

    localStorage.setItem(
      'access_token',
      response.data.access
    )
    

    localStorage.setItem(
      'refresh_token',
      response.data.refresh
    )
    localStorage.setItem('user',JSON.stringify(response.data.user))
    console.log("Logged in")

    // ✅ ONLY navigate on success
    navigate('/admin', { replace: true })

  } catch (error: any) {

    const backendError =
      error?.response?.data?.error ||
      error?.response?.data?.detail ||
      "Login failed"

    setGeneralerror(backendError)

  } finally {
    setLoading(false)
  }
}
  
 
  const token =
  localStorage.getItem("access_token")

  // already logged in
  if (token) {
    return <Navigate to="/admin" replace />
  }
  return (
    <div className='bg-gray-100 w-full h-screen flex items-center justify-center flex-col p-4'>
        <div className=' h-auto p-2 bg-white shadow rounded-lg flex flex-row flex-nowrap gap-2 '>
          <div className='md:flex flex-1 items-center justify-center hidden '>
            <img src={facialImage} alt="" className='size-60' />
          </div>
      
          <div className='flex flex-2 items-center justify-center relative'>
            {loading&&<div className=' absolute flex items-center justify-center w-full h-full text-blue-500 font-bold bg-white/90' style={{backgroundImage:`url(${loadingGif})`,backgroundSize:'cover',backgroundRepeat:"no-repeat"}}>loading..</div>}
            <form action="" onSubmit={handleSubmit} className={`flex  items-center justify-center flex-col gap-3  h-full p-2 `}>
              <h6 className='text-center font-bold text-xs'>STUDENT AUTHENTICATION SYSTEM IN 
              EXAMINATION ENTRANCE</h6>
              {(generalError)&&<span className='text-red-500 text-sm'>{generalError}</span>}
              <div className='flex flex-col w-full'>
                <input type="email" placeholder='Email' name='email' className='p-2 outline-1 rounded-md hover:outline-blue-500 border-none w-full' />
                {emailError&&<span className='text-red-500 text-sm'>{emailError}</span>}
              </div>
              <div className='flex flex-col w-full'>
                <input type="Password" placeholder='Password' name='password' className='p-2 outline-1 rounded-md hover:outline-blue-500 border-none w-full' />
                {passwordError&&<span className='text-red-500 text-sm'> {passwordError}</span>}
              </div>
              <input type="submit"  className='bg-blue-300 p-2 rounded-lg w-full  font-bold hover:bg-blue-400 cursor-pointer' />
            </form>
          </div>
        </div>
    </div>
  )
}

export default Login
