import {
  User,
  GraduationCap,
  ShieldCheck,
  ScanFace,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Wifi,
  Search,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

type Student = {
  id: string;
  registration_number: string;
  first_name: string;
  last_name: string;
  program_name: string;
  year_name: string;
  student_profile_image?: string;

  embedding_quality: number;
  embedding_accuracy: number;

  device_status: "online" | "offline";
  embedding_status: "verified" | "unverified";
};

export default function StudentFaceDashboard() {
  const navigate = useNavigate();

  const toRoman = (num:number) => {
  const romans = ["I", "II", "III", "IV"];
  return romans[num - 1];
};
  const [student_reg_number,setRgNumber] = useState<string>("")

  const [student,setStudent] = useState([]
    // {
    //   id: "1",
    //   registration_number: "22100534050078",
    //   first_name: "Idrisa",
    //   last_name: "Alkamu",
    //   program_name: "Computer Engineering",
    //   year_name: "Year III",
    //   embedding_quality: 92,
    //   embedding_accuracy: 96,
    //   device_status: "online",
    //   embedding_status: "verified",
    //   student_profile_image:
    //     "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    // },
  );

  function qualityColor(value: number) {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  }

  useEffect(()=>{
    try{
         const endpoint = student_reg_number
           ? `/student/embed/${student_reg_number}/`
           : "/student/embed/"

         api.get(endpoint)
         .then((res)=>setStudent(res.data))
         .catch((e)=>{
            console.log(e)
            setStudent([])
         })
        
    }catch(e){
        console.log(e)
    }
  },[student_reg_number])
  console.log(student)
  return (
    <div className="w-full p-4 space-y-6">

      {/* HEADER */}
      <div className="card rounded-2xl p-6 shadow-[0_0_30px_5px_rgba(0,0,0,0.08)]">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                <ScanFace className="w-7 h-7 text-blue-500" />
                Facial Recognition Dashboard
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                Monitor student embeddings, recognition quality and accuracy
                </p>
            </div>

            <div className="flex items-center gap-2 sidebar p-2 rounded-lg shadow-sm w-full md:w-96">
            <Search size={18} className="text-gray-500" />
            <input placeholder="Search student...,eg.22100..." className="outline-none w-full" 
            onChange={(e)=>setRgNumber(e.target.value)}/>
            </div>
          
        </div>
      </div>

      {/* DESKTOP TABLE */}
      
      <div className="hidden lg:block overflow-hidden rounded-2xl card shadow-[0_0_30px_5px_rgba(0,0,0,0.08)]">

        <table className="w-full">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr className="text-left text-sm">

              <th className="p-4">Student</th>
              <th className="p-4">Program</th>
              <th className="p-4">Embedding</th>
              <th className="p-4">Accuracy</th>
              {/* <th className="p-4">Device</th> */}
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>

            </tr>
          </thead>

          <tbody>
            {student?.map((student:any) => (
              <tr
                key={student?.id}
                className="
                  border-b border-gray-200 dark:border-gray-700
                  hover:bg-gray-100/40 dark:hover:bg-gray-800/40
                  transition
                "
              >

                {/* STUDENT */}
                <td className="p-4">

                  <div className="flex items-center gap-3">

                    <img
                      src={student.student_profile_image}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                    />

                    <div>
                      <h2 className="font-semibold">
                        {student?.student_name} 
                      </h2>

                      <p className="text-sm text-gray-500">
                        {student.student_registration_number}
                      </p>
                    </div>
                  </div>
                </td>

                {/* PROGRAM */}
                <td className="p-4">

                  <div className="space-y-1">
                    <p className="font-medium">
                      {student.program_name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {`Year ${toRoman(student?.year_name)}`}
                    </p>
                  </div>
                </td>

                {/* EMBEDDING QUALITY */}
                <td className="p-4">

                  <div className="space-y-2">

                    <div className="flex items-center justify-between text-sm">
                      <span>Quality</span>
                      <span>{student?.accuracy}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${qualityColor(
                          student.accuracy
                        )}`}
                        style={{
                          width: `${student.accuracy}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>

                {/* ACCURACY */}
                <td className="p-4">

                  <div className="flex items-center gap-2">

                    <ShieldCheck className="w-5 h-5 text-green-500" />

                    <span className="font-semibold">
                      {student?.accuracy}%
                    </span>
                  </div>
                </td>

                {/* DEVICE
                <td className="p-4">

                  <div className="flex items-center gap-2">

                    <Wifi
                      className={`w-4 h-4 ${
                        student.device_status === "online"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    />

                    <span>
                      {student.device_status}
                    </span>
                  </div>
                </td> */}

                {/* STATUS */}
                <td className="p-4">

                  <div
                    className={`
                      inline-flex items-center gap-2
                      px-3 py-1 rounded-full text-sm
                      ${
                        student.model_version === "face_recognition-dlib"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }
                    `}
                  >
                    {student.model_vesion === "face_recognition-dlib" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}

                    {student.embedding_status}
                  </div>
                </td>

                {/* ACTIONS */}
                <td className="p-4">

                  <div className="flex items-center justify-center gap-2">

                    <button
                      onClick={() =>
                        navigate(`/admin/student/${student.id}`)
                      }
                      className="
                        p-2 rounded-lg
                        hover:bg-blue-100 dark:hover:bg-blue-900/30
                        transition
                      "
                    >
                      <Eye className="w-4 h-4 text-blue-500" />
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/admin/student/edit/${student.id}`)
                      }
                      className="
                        p-2 rounded-lg
                        hover:bg-yellow-100 dark:hover:bg-yellow-900/30
                        transition
                      "
                    >
                      <Pencil className="w-4 h-4 text-yellow-500" />
                    </button>

                    <button
                      className="
                        p-2 rounded-lg
                        hover:bg-red-100 dark:hover:bg-red-900/30
                        transition
                      "
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      {student&&<div className="lg:hidden space-y-4">

        {student.map((student:any) => (
          <div
            key={student.id}
            className="
              card rounded-2xl p-4
              shadow-[0_0_30px_5px_rgba(0,0,0,0.08)]
            "
          >

            {/* TOP */}
            <div className="flex justify-between items-start">

              <div className="flex gap-3">

                <img
                  src={student.student_profile_image}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                />

                <div>
                  <h2 className="font-bold text-lg">
                    {student.student_name} 
                  </h2>

                  <p className="text-sm text-gray-500">
                    {student.student_registration_number}
                  </p>

                  <p className="text-sm mt-1">
                    {student.program_name}
                  </p>
                </div>
              </div>

              <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* QUALITY */}
            <div className="mt-5 space-y-4">

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Embedding Quality</span>
                  <span>{student.accuracy}%</span>
                </div>

                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full ${qualityColor(
                      student.accuracy
                    )}`}
                    style={{
                      width: `${student.accuracy}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span>
                    Accuracy {student.accuracy}%
                  </span>
                </div>

                <div
                  className={`
                    px-3 py-1 rounded-full text-sm
                    ${
                      student.model_version === "face_recognition-dlib"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }
                  `}
                >
                  {"verified"}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="grid grid-cols-3 gap-2 pt-2">

                <button
                  onClick={() =>
                    navigate(`/admin/student/${student.id}`)
                  }
                  className="
                    py-3 rounded-xl
                    bg-blue-500/10 text-blue-500
                    flex items-center justify-center gap-2
                  "
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>

                <button
                  onClick={() =>
                    navigate(`/admin/student/edit/${student.id}`)
                  }
                  className="
                    py-3 rounded-xl
                    bg-yellow-500/10 text-yellow-600
                    flex items-center justify-center gap-2
                  "
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>

                <button
                  className="
                    py-3 rounded-xl
                    bg-red-500/10 text-red-500
                    flex items-center justify-center gap-2
                  "
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}