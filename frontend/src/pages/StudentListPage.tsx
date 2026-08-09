import { useEffect, useState } from "react"
import api from "../api/axios"
import { Clock10, GraduationCap, Hash, IdCard, ScanFace, Search, Settings2, User, UserCircle, UserRound, UserRoundCheck } from "lucide-react"
import StudentCard from "../component/StudentCardInMob"
import { StudentListDesk } from "../component/StudentListDesk"
import { toast } from "sonner"
import spiner from "../assets/iconImage/scanner.gif"

export default function Students() {
  const [id,setId] = useState<string>("")
  const [students, setStudents] = useState([])
  const [noMatch,setNomatch] =useState<boolean>(false)

  useEffect(() => {

    const endpoint = id
      ? `/students/search/${id}/`
      : "/students/search/"

    api.get(endpoint)
      .then(res => {console.log(res)
         setStudents(res.data)
         setNomatch(false)
        })
      .catch((e)=>{setStudents([]); setNomatch(true)})
    
      
    
    
  }, [id])
  console.log(students)
  return (
    <div className="flex flex-col h-auto overflow-y-hidden gap-2 w-full">
      <h1 className="text-2xl font-bold">
        Students
      </h1>

      {/* Search */}
      <div className="flex items-center gap-2 sidebar p-2 border border-transparent rounded-lg shadow-sm w-full md:w-96 focus-within:border  focus-within:border-blue-600">
        <Search size={18} className="text-gray-500" />
        <input
          placeholder="Search student..."
          className="outline-none w-full"
          onChange={e=>setId(e.target.value)}
        />
      </div>
    
         {/* Table */}
      {noMatch?<div className="w-full  h-full flex items-center justify-center text-gray-500">
        <span>No match Found</span>
      </div>:
      <div className=" shadow-sm rounded-t-lg overflow-hidden md:block hidden">
        <table className="w-full text-sm">
          <thead className="header ">
            <tr >
              <th className=" text-left">
                <div className="flex flex-row flex-nowrap items-center gap-2 p-2">
                  <UserCircle size={16} className="font-bold"/>
                  Profile
                </div>
              </th>
              <th className="  text-left">
                <div className="flex flex-row flex-nowrap items-center gap-2 p-2">
                  <IdCard size={16} className="font-bold"/>
                  Id
                </div>
              </th>
              <th className="  text-left">
                <div className="flex flex-row flex-nowrap items-center gap-2 p-2">
                  <UserRoundCheck size={16} className="font-bold"/>
                  Name
                </div>
              </th>
              <th className="  text-left">
                <div className="flex flex-row flex-nowrap items-center gap-2 p-2">
                  <GraduationCap size={16} className="font-bold"/>
                  Program
                </div>
              </th>
              <th className="  text-left">
                <div className="flex flex-row flex-nowrap items-center gap-2 p-2">
                  <Hash size={16} className="font-bold"/>
                  Year
                </div>
              </th>
              <th className="  text-left">
                <div className="flex flex-row flex-nowrap items-center gap-2 p-2">
                  <User size={16} className="font-bold"/>
                  Stutus
                </div>
              </th>
              <th className="  text-left">
                <div className="flex flex-row flex-nowrap items-center gap-2 p-2">
                  <ScanFace size={16} className="font-bold"/>
                  <p className="line-clamp-1 text-ellipsis">Fece Embedded</p>
                </div>
              </th>
              <th className="  text-left">
                <div className="flex flex-row flex-nowrap items-center gap-2 p-2">
                  <Settings2 size={16} className="font-bold"/>
                  Action
                </div>
              </th>
            </tr>
          </thead>

          {students.map((stdnt:any,index)=>(
          <StudentListDesk student={{
                key:index,
                studentId:stdnt.id,
                id: stdnt.registration_number,
                name: `${stdnt.first_name} ${stdnt.last_name}`,
                program_name: stdnt.program_name,
                year: stdnt.year_name,
                image: stdnt.student_profile_image,
                status: stdnt.status,
                embedded:false,
            }}/>
          ))}
        </table>
      </div>}
      {/* mobile */}
      {students&&students.map((stdnt:any,index)=>(
        <StudentCard student={{
          key:index,
          studentId:stdnt.id,
          id: stdnt.registration_number,
          name: `${stdnt.first_name} ${stdnt.last_name}`,
          program_name: stdnt.program_name,
          year: stdnt.year_name,
          image: stdnt.student_profile_image,
          status: stdnt.status
        }}/>
      ))}
  </div>
  )
}