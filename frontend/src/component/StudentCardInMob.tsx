import { MoreVertical, User, Phone, Mail,IdCard,GraduationCap, Hash } from "lucide-react";
import { useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/axios";

type Student = {
  key:number;
  studentId:string,
  id: number;
  name: string;
  year: string;
  program_name: string;
  image?: string;
  status: boolean;
};

export default function StudentCard({ student }: { student: Student }) {
const [open, setOpen] = useState(false);
const [infoOpen,setInfoOpen] = useState<boolean>(false)
const [isLoading,setLoading] = useState<string|null>()
const containerRef = useRef<HTMLDivElement>(null);
const navigate = useNavigate(); 


function handleNavigation(path:string,id: string) {
  navigate(`${path+id}`);
}

useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
      setInfoOpen(false);
    }
  };

  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, []);

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
    <div key={student.key} ref={containerRef} className="w-full md:hidden card  rounded-2xl shadow-lg shadow-black/10 p-4 transition-all">
      {/* HEADER */}
      <div className="flex items-center justify-between cursor-pointer" >

        <div className="flex items-center gap-3 "  onClick={()=>setInfoOpen(!infoOpen)} >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-500/30 rounded-full" >
            {student.image?<img
            src={student?.image}
            className="w-10 h-10 rounded-full object-cover "
            />:<span className={"font-bold w-10 h-10 flex items-center justify-center rounded-full"}
             style={{backgroundColor:`#${Math.floor(Math.random() * 16777215).toString(16)}`,opacity:0.7}}>{(student?.name).slice(0,1).toUpperCase()}</span>}
          </div>
          

          <div>
            <h2 className="text-sm font-semibold ">
              {student.name}
            </h2>

            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                student.status
                  ? "bg-green-200 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {student.status?"active":"inactive"}
            </span>
          </div>
        </div>

        {/* OPTIONS */}
        <div className="relative"  >
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MoreVertical size={18} />
          </button>

          {open && (
            <div         
            className='absolute right-0 mt-2 w-32 sidebar shadow-xl rounded-lg overflow-hidden z-50 p-0.5'
            >
              <button onClick={() => {setInfoOpen(true);setOpen(false);}} className="w-full px-3 py-2 text-left  menu-item text-sm">
                View
              </button>
              <button className="w-full px-3 py-2 text-left menu-item text-sm" onClick={() => handleNavigation("/admin/student/edit/",student.studentId)}>
                Edit
              </button>
              {student&&<button onClick={()=>handleNavigation("/admin/student/faceupload/",student.studentId)} className="w-full px-3 py-2 text-left menu-item  text-sm">
                Embed FaceId
              </button>}
              <button className="w-full px-3 py-2 text-left menu-item text-red-500 text-sm" onClick={()=>handleDelete(student.studentId,student.name)}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DETAILS */}
    {infoOpen&&<div 
     className="mt-4 space-y-2 text-sm text-gray-500 "
     >

        <div className="flex items-center gap-2">
          <IdCard size={14} />
          {student.id}
        </div>

        <div className="flex items-center gap-2">
          <GraduationCap size={14} />
          {student.program_name}
        </div>

        <div className="flex items-center gap-2">
          <Hash size={14} />
           {student.year}
        </div>
      </div>}
    </div>
  );
}