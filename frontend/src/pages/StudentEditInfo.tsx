import {
  User,
  Phone,
  GraduationCap,
  CalendarDays,
  IdCard,
  Camera,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import { useParams } from "react-router-dom";

type Program = { id: string; name: string };
type Department = { id: string; name: string };
type AcademicYear = { id: string; year_display: string };

type Student = {
  id: string;
  registration_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: string;
  program: string;
  year: string;
  status: boolean;
  student_profile_image?: string;
};

const emptyForm = {
  registration_number: "",
  first_name: "",
  last_name: "",
  phone: "",
  department: "",
  program: "",
  year: "",
  status:true,
  student_profile_image: null as File | null,
};

export default function StudentUpdateForm() {
  const { id } = useParams();

  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [formData, setFormData] = useState(emptyForm);

  // ================= FETCH STUDENT =================
  useEffect(() => {
    if (!id) return;

    async function fetchStudent() {
      try {
        const res = await api.get(`/students/${id}/`);
        const data: Student = res.data;

        setFormData({
          registration_number: data.registration_number,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          department: data.department,
          program: data.program,
          year: data.year,
          status: data.status,
          student_profile_image: null,
        });

        setPreview(data.student_profile_image || null);
      } catch (err) {
        toast.error("Failed to load student");
      }
    }

    fetchStudent();
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      student_profile_image: file,
    }));

    setPreview(URL.createObjectURL(file));
  }

  // ================= FETCH DEPARTMENTS + YEARS =================
  useEffect(() => {
    async function fetchData() {
      const [dep, year] = await Promise.all([
        api.get("/departments"),
        api.get("/academic-years"),
      ]);

      setDepartments(dep.data);
      setYears(year.data);
    }

    fetchData();
  }, []);

  // ================= FETCH PROGRAMS =================
  useEffect(() => {
    if (!formData.department) return;

    async function fetchPrograms() {
      const res = await api.get(
        `/department/programs/${formData.department}`
      );
      setPrograms(res.data);
    }

    fetchPrograms();
  }, [formData.department]);

  // ================= UPDATE =================
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          data.append(key, value as any);
        }
      });
  
      const res = await api.put(`/students/${id}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
      

      if (res.data.success) {
        toast.success("Student updated successfully");
        console.log(res.data)
      } else {
        toast.error("Fail to update Student");
      }
    } catch (err) {
      toast.error("Update failed");
      console.log(err)
      
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full transition-colors duration-300 flex items-start justify-center">

      <div className="w-full md:grid md:grid-cols-2 card rounded-lg p-6 shadow-[0_0_30px_5px_rgba(0,0,0,0.08)]">

        {/* IMAGE SECTION */}
        <div className="flex justify-center flex-col items-center mb-6">

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Update Student</h1>
            <p className="text-sm text-gray-500 mt-1">
              Edit student information
            </p>
          </div>

          <div className="relative">

            <div className="
              w-28 h-28 rounded-full
              bg-blue-500/10
              border-4 border-(--header)
              shadow-lg
              overflow-hidden
              flex items-center justify-center
            ">
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-blue-500" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="
                absolute bottom-1 right-1
                w-9 h-9 rounded-full
                bg-blue-600 text-white
                flex items-center justify-center
                shadow-lg hover:bg-blue-700
              "
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              type="file"
              ref={fileRef}
              hidden
              accept="image/*"
              onChange={handleImage}
            />
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleUpdate} className="space-y-4">

          {/* NAME */}
          <div className="md:flex gap-2 space-y-4 md:space-y-0">

            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">First Name</label>
              <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3">
                <User className="w-4 h-4 text-gray-500" />
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Last Name</label>
              <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3">
                <User className="w-4 h-4 text-gray-500" />
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* PHONE */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone</label>
            <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* REGISTRATION */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Registration Number</label>
            <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3">
              <IdCard className="w-4 h-4 text-gray-500" />
              <input
                name="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* DEPARTMENT */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Department</label>
            <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3">
              <CalendarDays className="w-4 h-4 text-gray-500" />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
              >
                <option>Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PROGRAM */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Program</label>
            <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3">
              <GraduationCap className="w-4 h-4 text-gray-500" />
              <select
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
              >
                <option>Select program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* YEAR + STATUS */}
          <div className="md:flex gap-2 space-y-4 md:space-y-0">

            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Year</label>
              <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                >
                  <option>Select year</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.year_display}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Status</label>
              <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3">
                <select
                  value={formData.status ? "active" : "inactive"}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      status: e.target.value === "active",
                    }))
                  }
                  className="w-full bg-transparent outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="
              w-full py-3 rounded-xl
              bg-green-600
              hover:bg-green-700
              text-white font-medium
              transition-all duration-300
              shadow-lg shadow-green-500/20
              hover:-translate-y-0.5
            "
          >
            {loading ? "Updating..." : "Update Student"} 
          </button>
        </form>
      </div>
    </div>
  );
}