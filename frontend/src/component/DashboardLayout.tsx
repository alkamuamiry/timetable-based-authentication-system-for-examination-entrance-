import Sidebar from "./SideBar"
import Navbar from "./NavBar"
import { useEffect } from "react"
import { useAppContext } from "./AppContext"
import { BottomNavBar } from "./BottomNavBar"
export default function DashboardLayout({ children }: any) {
  const {triger,theme,setTheme} = useAppContext()
    const mediaQuery = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );
  useEffect(() => {
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);
  return (
    <div className={`flex flex-col h-screen relative ${theme} text overflow-x-hidden`}>
      <Navbar />
      <div className="flex flex-row flex-nowrap flex-1 grow  ">
        <Sidebar /> 
        {/* NAVBAR (NOW VISIBLE) */}
        <div className="flex flex-1 p-4 bg-(--surface) mt-16 pb-18  ">
          {children}
        </div>
      </div>
      <BottomNavBar/>

    </div>
  )
}