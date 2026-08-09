import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { LogOut, Mail, Menu, Moon, Sun, User, UserCircle } from "lucide-react"
import faceIcon from "../assets/iconImage/logo-png-png.png"
import { useAppContext } from "./AppContext"
import { useState,useEffect ,useRef} from "react"
export default function Navbar() {
const {theme,setTheme,triger,setTringer} = useAppContext()
const [openDrop,setOpenDrop] = useState<boolean>(false)

const dropdownRef = useRef<HTMLDivElement>(null);
type userData = {
  id:string;
  email:string;
  name:string;

}

const [user_profile_image,setUserProfileImage] = useState<string | null>(null)
const [user,setUser] = useState<userData | null>(null)
const fetched = useRef(false);

useEffect(() => {

  if (fetched.current) return;

  fetched.current = true;

  async function getUserProfile() {

    try {

      const res = await api.get("/user/profile/image");

      if (res.data?.profile_image) {
        setUserProfileImage(res.data.profile_image);
      }

    } catch (e) {
      console.log("Image failed to load");
    }
  }

  getUserProfile();

}, []);

console.log(user_profile_image)
useEffect(()=>{
  try{
    const profile = JSON.parse(localStorage.getItem("user") || "null");
    setUser(profile)
  }catch(e){
    console.log("error on geting user info")
  }
},[])
const navigate = useNavigate()
    const logout = async ()=>{
        const refresh = localStorage.getItem("refresh_token")
        try{
            await api.post('/logout/',{refresh})
            localStorage.removeItem("access_token")
            localStorage.removeItem("reflesh_token")
            navigate('/login', {replace:true})
        }
        catch(e){
            alert("fail to logout")
            console.log(e)
        }
        finally{
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            navigate("/login")
        }
    }
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDrop(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

    return (
    <div className="h-16 header flex items-center justify-between px-6 w-full z-50 fixed">

      {/* Left */}
      <div className="flex flex-row  gap-2 items-center justify-start">
        <img
      src={faceIcon}
      alt="Face Recognition"
      className="w-6 h-6 md:w-9 md:h-9 object-contain"
    />
        <h1 className="text-xl hidden md:block font-bold text-blue-500">
         Student Authentication System
      </h1>
      <h1 className="text-md block md:hidden font-bold overflow-hidden text-ellipsis text-blue-500">
         StudentAuth
      </h1>
      </div>
      

      {/* Right */}
      <div className={`flex items-center gap-4`}>
        <div className=" flex flex-nowrap flex-row">
          {theme === "light"?<Moon  onClick={()=>setTheme("dark")}/>:<Sun onClick={()=>setTheme("light")}/>}
          
        </div>
        
        <div ref ={dropdownRef} className="inline-block relative cursor-pointer">
          <div className="flex flex-row flex-nowrap items-center gap-2 p-0.5 px-1  rounded-full hover:bg-(--surface) " onClick={(e)=>{e.stopPropagation();setOpenDrop(!openDrop)}}>
            <div className="relative size-6 flex items-center justify-center p-4 bg-gray-500/30 rounded-full font-bold">
              {user_profile_image?<img src={user_profile_image} className="size-5 rounded-full absolute  hover:size-6"/>:user?.name[0]} 
            </div>
            <span className="text-sm font-bold select-none hidden md:block ">Admin</span>
          </div>
          {openDrop&&<div  className="absolute right-0 w-40 h-auto  sidebar flex flex-col shadow-2xl  justify-start   mt-2 rounded-lg  transition-all duration-200">
                <div className=" flex  flex-col text-gray-500 font-bold p-2 bg-(--surface) rounded-t-lg border-b">
                  <div className="flex flex-row flex-nowrap items-center gap-1">
                    <Mail className="size-4"/>
                    <p className="text-xs font-extralight overflow-hidden text-ellipsis text-nowrap">{user?.email}</p>
                  </div>
                  <div className="flex flex-row flex-nowrap items-center gap-1 justify-start">
                    <User className="size-4"/>
                    <p className="text-xs font-extralight overflow-hidden text-ellipsis text-nowrap"> {user?.name}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className=" rounded-b-lg rounded-none flex flex-nowrap items-center gap-2  px-2 py-1.5  text-sm menu-item "
                >
                  <LogOut size={16} className="text-red-500" />
                  Logout
                </button>
          </div>}
        </div>

        
         
         <Menu className=" md:hidden " onClick={()=>setTringer(!triger)}/>

      </div>

    </div>
  )
}