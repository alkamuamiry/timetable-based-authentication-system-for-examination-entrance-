import { CheckCircle, Edit2, Eye, Trash2, XCircle } from "lucide-react";
import { NavLink,useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/axios";
import { useState } from "react";

type Student = {
  key:number;
  studentId:string,
  id: number;
  name: string;
  year: string;
  program_name: string;
  image?: string;
  status: boolean;
  embedded:true |false;
};
export const StudentListDesk = ({student}: { student: Student })=>{
    const navigate = useNavigate()
    const [isLoading,setLoading] = useState<string|null>(null)
    function handleNavigation(studentId:string){
        if(!student) return;
        navigate(`/admin/student/faceupload/${studentId}`)
    }
    async function handleDelete(id:string,student_name:string){
        const is_confirmed = window.confirm(`Are you want delete ${student_name}`)
        if(is_confirmed){
            try{
                setLoading(id)
                await api.delete(`students/${id}/`)
                toast.success(`Deleted successfully`)
            }catch(e){
                console.log(e)
                toast.error("Fail fail to delete")
                setLoading(null)
            }finally{
                setLoading(null)
            }
        }

    }
    return (
          <tbody id={student.key.toString()} className="sidebar">
              <tr key={student.key} className="border-b border-gray-500/50" >
                <td className="p-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-500/30 rounded-full" >
                        {student.image?<img
                        src={student?.image}
                        className="w-7 h-7 rounded-full object-cover "
                        />:<span className={"font-bold size-8 flex items-center justify-center rounded-full"}
                        style={{backgroundColor:`#${Math.floor(Math.random() * 16777215).toString(16)}`,opacity:0.7}}>{(student?.name).slice(0,1).toUpperCase()}</span>}
                    </div>
                </td>
                <td className="p-1"><p className="overflow-hidden text-ellipsis">{student.id}</p></td>
                <td className="p-1"><p className="line-clamp-1 text-ellipsis">{student.name }</p></td>
                <td className="p-1"><p className="line-clamp-1 text-ellipsis">{student.program_name }</p></td>
                <td className="p-1"><p className="line-clamp-1 text-ellipsis">{student.year}</p></td>
                <td className="p-1">
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                            student.status
                            ? "bg-green-200 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                        >
                        {student.status?"active":"inactive"}
                    </span>
                </td>
                <td className="p-1">
                    {student.embedded?
                    <div className="flex flex-row items-center justify-start flex-nowrap gap-2">
                        <CheckCircle size={17} className="text-green-600"/>
                        <span className="text-green-600 text-sm">embeded</span>
                        </div>
                    :<div className="flex flex-row items-center justify-start flex-nowrap gap-2">
                        <XCircle size={17} className="text-red-600"/>
                        <button onClick={()=>handleNavigation(student.studentId)} className=" rounded-lg  px-1 py-0.5 text-xs cursor-pointer shadow-md header btn-secondary">register</button>
                        </div>}
                </td>
                <td className="p-1">
                        <nav className="flex flex-row flex-nowrap gap-0.5">
                            <NavLink to={""} className={"px-2 hover:shadow-2xl hover:bg-blue-500 hover:text-white text-blue-500 py-1 rounded-2xl  flex flex-nowrap items-center justify-center"}>
                                <Eye size={17}  />
                            </NavLink>
                            <NavLink to={`/admin/student/edit/${student.studentId}`} className={"px-2 hover:shadow-2xl hover:bg-yellow-500 hover:text-white text-yellow-500 py-1 rounded-2xl  flex flex-nowrap items-center justify-center"}>
                                <Edit2 size={16} />
                            </NavLink>
                            <button onClick={()=>handleDelete(student.studentId,student.name)}  className={"px-2 hover:shadow-2xl hover:bg-red-500 hover:text-white text-red-500 py-1 rounded-2xl  flex flex-nowrap items-center justify-center"}>
                                <Trash2 size={16} />
                            </button>
                        </nav>
                </td>
              </tr>
          </tbody>
    )
}