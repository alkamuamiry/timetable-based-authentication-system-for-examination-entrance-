import { useAppContext } from "./AppContext"
import { useState } from "react"
import { NavLink } from "react-router-dom"
import { LayoutDashboard,Users,UserPlus,Settings,Monitor, MoreVertical } from "lucide-react"
export  const BottomNavBar = ()=>{
    const {triger,theme,setTheme} = useAppContext()

    const menu = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Students", path: "/admin/students", icon: Users },
    { name: "Register", path: "/admin/register", icon: UserPlus },
    { name: "Settings", path: "/admin/settings", icon: Settings },
    { name: "More", path: "/admin/devices", icon: MoreVertical },
    ]
    return(
        <div className={`fixed bottom-0 md:hidden bg-linear-to-b from-transparent via-(--header) to-(--header) w-full h-auto transition-all
         duration-800 ease-in-out rounded-t-2xl 
        ${triger? "flex" : "hidden"}`}>
        <nav className="flex-1 py-2 gap-1  flex flex-row flex-nowrap justify-center overflow-hidden ">
            {menu.map((item, i) => {
            const Icon = item.icon

            return (
            
                <NavLink
                key={i}
                to={item.path}
                end={item.path === "/admin"}
                className={`
                    rounded-xl
                    flex items-center flex-col
                    menu-item 
                    transition
                `}
                >
                <Icon size={20} />
                    <span className="text-xs">
                    {item.name}
                    </span>
                </NavLink>
            )
            })}

      </nav>
      </div>
    )
}