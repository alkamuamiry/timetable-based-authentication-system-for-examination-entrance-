import { useState } from "react"
import { NavLink } from "react-router-dom"
import { useAppContext } from "./AppContext"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Monitor,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  ScanFace,
} from "lucide-react"

export default function Sidebar() {

  const [open, setOpen] = useState(true)

  const menu = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Students", path: "/admin/students", icon: Users },
    { name: "Student Faceids", path: "/admin/faceid", icon: ScanFace },
    { name: "Student Registration", path: "/admin/register", icon: UserPlus },
    { name: "Devices", path: "/admin/devices", icon: Monitor },
  ]



  return (
    <div
      className={`
        mt-16
        hidden 
        relative  sidebar
        md:flex flex-col
        transition-all duration-300 ease-in-out
        ${open ? "w-64" : "w-16"}
      `}
    >

      {/* SIDEBAR HEADER */}
<div className="h-16 gap-3 flex items-center justify-center border-b border-gray-800 relative">
      <Home
      className="w-6 h-6 object-contain"
    />
  {/* EXPANDED TEXT */}
  {open && (
    <h2 className="text-lg font-bold">
      FaceAuth
    </h2>
  )}

  
 

</div>

      {/* MENU */}
      <nav className="flex-1 py-4 space-y-1">

        {menu.map((item, i) => {
          const Icon = item.icon

          return (
          
            <NavLink
              key={i}
              to={item.path}
              end={item.path === "/admin"}
              className={`
                flex items-center
                ${open ? "px-4 gap-3" : "justify-center"}
                py-3 mx-2 rounded-lg
                menu-item 
                transition
              `}
            >
              <Icon size={20} />

              {open && (
                <span className="text-sm">
                  {item.name}
                </span>
              )}
            </NavLink>
          )
        })}

      </nav>

      {/* FLOATING TOGGLE BUTTON */}
   {/* FLOATING TOGGLE BUTTON (ALIGNED WITH DASHBOARD ROW) */}
<button
  onClick={() => setOpen(!open)}
  className="
    absolute
    top-[88px]   /* 👈 aligns with first menu item (Dashboard row) */
    -right-3
     hover:bg-gray-700/30
     p-1.5
    rounded-full shadow-lg
    border border-gray-600/40
    transition
  "
>
  {open ? (
    <ChevronLeft size={16} />
  ) : (
    <ChevronRight size={16} />
  )}
</button>

    </div>
  )
}