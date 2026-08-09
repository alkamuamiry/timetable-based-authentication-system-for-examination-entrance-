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
import spiner from "../../src/assets/iconImage/spinerloader.gif"

type Program = {
  id: string;
  name: string;
};

type Department = {
  id: string;
  name: string;
};

type AcademicYear = {
  id: string;
  year_display: string;
};

const initialFormState = {
  registration_number: "",
  first_name: "",
  last_name: "",
  phone: "",
  department: "",
  program: "",
  year: "",
  status: false,
  student_profile_image: null as File | null,
};

export default function StudentRegistrationPage() {

  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [formData, setFormData] = useState(initialFormState);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================
  // HANDLE IMAGE
  // =========================
  function handleImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = e.target.files?.[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      student_profile_image: file,
    }));

    try{
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    }catch(e){

    }finally{

    }
    

    
  }

  // CLEANUP PREVIEW MEMORY
  useEffect(() => {

    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };

  }, [preview]);

  // =========================
  // SUBMIT FORM
  // =========================
  async function handleSubmit(
    e: React.FormEvent
  ) {
    console.log(formData)
    e.preventDefault();

    // BASIC VALIDATION
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.registration_number ||
      !formData.department ||
      !formData.program ||
      !formData.year
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {

      setLoading(true);

      const submitData = new FormData();

      submitData.append(
        "registration_number",
        formData.registration_number
      );

      submitData.append(
        "first_name",
        formData.first_name
      );

      submitData.append(
        "last_name",
        formData.last_name
      );

      submitData.append(
        "phone",
        formData.phone
      );

      submitData.append(
        "department",
        formData.department
      );

      submitData.append(
        "program",
        formData.program
      );

      submitData.append(
        "year",
        formData.year
      );

      submitData.append(
        "status",
        String(formData.status)
      );
     

      if (formData.student_profile_image) {

        submitData.append(
          "student_profile_image",
          formData.student_profile_image
        );
      }
      
      const res = await api.post(
        "/students/",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      if (res.data.success) {

        toast.success(
          res.data.message ||
          "Student registered successfully"
        );

        // RESET FORM
        setFormData(initialFormState);

        setPrograms([]);

        setPreview(null);

        // RESET FILE INPUT
        if (fileRef.current) {
          fileRef.current.value = "";
        }

      } else {

        toast.error(
          res.data.message || "Failed to register"
        );
      }

    } catch (e: any) {

      console.log(e.response.data.error);

      toast.error(
        e?.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);
    }
  }

  // =========================
  // FETCH YEARS + DEPARTMENTS
  // =========================
  useEffect(() => {

    async function fetchData() {

      try {

        const [departmentRes, yearRes] =
          await Promise.all([
            api.get("/departments"),
            api.get("/academic-years"),
          ]);

        setDepartments(departmentRes.data);
        setYears(yearRes.data);

      } catch (e) {

        console.log(e);

        toast.error(
          "Failed to fetch departments and years"
        );
      }
    }

    fetchData();

  }, []);

  // =========================
  // FETCH PROGRAMS
  // =========================
  useEffect(() => {

    if (!formData.department) {

      setPrograms([]);

      setFormData((prev) => ({
        ...prev,
        program: "",
      }));

      return;
    }

    async function fetchPrograms() {

      try {

        const res = await api.get(
          `/department/programs/${formData.department}`
        );

        setPrograms(res.data);

      } catch (e) {

        console.log(e);

        toast.error(
          "Failed to fetch programs"
        );
      }
    }

    fetchPrograms();

  }, [formData.department]);

  return (
    <div className="w-full transition-colors duration-300 flex items-start justify-center">

      <div className="w-full md:grid md:grid-cols-2 card rounded-lg p-6 shadow-[0_0_30px_5px_rgba(0,0,0,0.08)] transition-all duration-300">

        {/* PROFILE IMAGE */}
        <div className="flex justify-center flex-col items-center mb-6">

          {/* HEADER */}
          <div className="mb-6 text-center">

            <h1 className="text-2xl font-bold">
              Student Registration
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Register new student information
            </p>
          </div>

          <div className="relative">

            <div
              className="
                w-28 h-28 rounded-full
                bg-blue-500/10
                border-4 border-(--header)
                shadow-lg
                overflow-hidden
                flex items-center justify-center
              "
            >

              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-blue-500" />
              )}
            </div>

            {/* IMAGE BUTTON */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="
                absolute bottom-1 right-1
                w-9 h-9 rounded-full
                bg-blue-600 text-white
                flex items-center justify-center
                shadow-lg
                hover:bg-blue-700
                transition
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
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div className="space-y-4 md:space-y-0 md:flex-row md:flex gap-2">

            {/* FIRST NAME */}
            <div className="space-y-1 flex-1">

              <label className="text-sm font-medium dark:text-gray-300">
                First Name
              </label>

              <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3 focus-within:border-blue-500 transition-colors">

                <User className="w-4 h-4 text-gray-500" />

                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  placeholder="Enter first name"
                  className="w-full bg-transparent outline-none text-gray-500"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* LAST NAME */}
            <div className="space-y-1 flex-1">

              <label className="text-sm font-medium dark:text-gray-300">
                Last Name
              </label>

              <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3 focus-within:border-blue-500 transition-colors">

                <User className="w-4 h-4 text-gray-500" />

                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  placeholder="Enter last name"
                  className="w-full bg-transparent outline-none text-gray-500"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* PHONE + REG NUMBER */}
          <div className="space-y-4 md:space-y-0 md:flex-row md:flex gap-2">

            {/* PHONE */}
            <div className="space-y-1 flex-1">

              <label className="text-sm font-medium dark:text-gray-300">
                Phone Number
              </label>

              <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3 focus-within:border-blue-500 transition-colors">

                <Phone className="w-4 h-4 text-gray-500" />

                <input
                  type="text"
                  name="phone"
                  maxLength={10}
                  value={formData.phone}
                  placeholder="Enter phone number"
                  className="w-full bg-transparent outline-none text-gray-500"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* REGISTRATION NUMBER */}
            <div className="space-y-1 flex-1">

              <label className="text-sm font-medium dark:text-gray-300">
                Registration Number
              </label>

              <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3 focus-within:border-blue-500 transition-colors">

                <IdCard className="w-4 h-4 text-gray-500" />

                <input
                  type="text"
                  name="registration_number"
                  maxLength={14}
                  value={formData.registration_number}
                  placeholder="Enter registration number"
                  className="w-full bg-transparent outline-none text-gray-500"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* DEPARTMENT */}
          <div className="space-y-1">

            <label className="text-sm font-medium dark:text-gray-300">
              Department
            </label>

            <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3 focus-within:border-blue-500 transition-colors">

              <CalendarDays className="w-4 h-4 text-gray-500" />

              <select
                name="department"
                value={formData.department}
                className="w-full bg-transparent outline-none"
                onChange={handleChange}
              >

                <option value="">
                  Select department
                </option>

                {departments.map((dept) => (
                  <option
                    key={dept.id}
                    value={dept.id}
                  >
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PROGRAM */}
          <div className="space-y-1">

            <label className="text-sm font-medium dark:text-gray-300">
              Program
            </label>

            <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3 focus-within:border-blue-500 transition-colors">

              <GraduationCap className="w-4 h-4 text-gray-500" />

              <select
                name="program"
                value={formData.program}
                disabled={!formData.department}
                className="w-full bg-transparent outline-none disabled:opacity-50"
                onChange={handleChange}
              >

                <option value="">
                  Select program
                </option>

                {programs.map((progm) => (
                  <option
                    key={progm.id}
                    value={progm.id}
                  >
                    {progm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* YEAR + STATUS */}
          <div className="space-y-4 flex flex-col md:space-y-0 md:flex-row md:flex gap-2">

            {/* YEAR */}
            <div className="space-y-1">

              <label className="text-sm font-medium dark:text-gray-300">
                Year of Study
              </label>

              <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3 focus-within:border-blue-500 transition-colors">

                <CalendarDays className="w-4 h-4 text-gray-500" />

                <select
                  name="year"
                  value={formData.year}
                  className="w-full bg-transparent outline-none"
                  onChange={handleChange}
                >

                  <option value="">
                    Select year
                  </option>

                  {years.map((y) => (
                    <option
                      key={y.id}
                      value={y.id}
                    >
                      {y.year_display}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* STATUS */}
            <div className="space-y-1 grow">

              <label className="text-sm font-medium dark:text-gray-300">
                Status
              </label>

              <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3 focus-within:border-blue-500 transition-colors">

                <select
                  value={
                    formData.status
                      ? "active"
                      : "inactive"
                  }
                  onChange={(e) => {

                    setFormData((prev) => ({
                      ...prev,
                      status:
                        e.target.value === "active",
                    }));
                  }}
                  className="
                    w-full rounded-xl
                    bg-transparent
                    outline-none
                  "
                >

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white font-medium
              transition-all duration-300
              shadow-lg shadow-blue-500/20
              hover:-translate-y-0.5
              cursor-pointer
              disabled:opacity-70
              disabled:cursor-not-allowed
              flex items-center justify-center
            "
          >
            {loading
              ? <div className="h-6 flex gap-1.5 items-center justify-center"><img src={spiner} className="size-6 "/>Registering..</div>
              : "Register Student"}
          </button>
        </form>
      </div>
    </div>
  );
}