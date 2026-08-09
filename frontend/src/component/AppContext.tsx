import React, { createContext, useContext,useState } from "react"
type AppContextType = {
    theme:string,
    setTheme:React.Dispatch<React.SetStateAction<string>>,
    triger :Boolean,
    setTringer:React.Dispatch<React.SetStateAction<boolean>>
}
const AppContext = createContext<AppContextType |null>(null)
export const AppProvider = ({children}:{children:React.ReactNode})=>{
    const [theme,setTheme] = useState<string>("light")
    const [triger,setTringer] = useState<boolean>(false)
    return(
        <AppContext.Provider value={{theme,setTheme,triger,setTringer}}>
            {children}
        </AppContext.Provider>
    )

}

export const useAppContext = ()=>{
    const context = useContext(AppContext);
    if(!context){
        throw new Error ("Context missing")
    }
    return context
}