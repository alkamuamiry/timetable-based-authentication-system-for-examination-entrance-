import {
  Camera,
  ScanFace,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Upload,
  RotateCcw,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import { useParams } from "react-router-dom";

type ExtractionResult = {
  success: boolean;
  quality: number;
  accuracy: number;
  accepted: boolean;
  message: string;
};

type Student = {
  id: string;
  first_name: string;
  last_name: string;
  registration_number: string;
  program_name?: string;
  student_profile_image?: string;
};

export default function StudentFaceUploadPage() {

  // =========================
  // GET STUDENT ID
  // =========================
  const { id } = useParams();

  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [image, setImage] =
    useState<File | null>(null);

  const [student, setStudent] =
    useState<Student | null>(null);

  const [result, setResult] =
    useState<ExtractionResult | null>(null);

  // =========================
  // FETCH STUDENT
  // =========================
  useEffect(() => {

    if (!id) return;

    async function fetchStudent() {

      try {

        const res = await api.get(
          `/students/${id}/`
        );

        console.log(res.data);

        setStudent(res.data);

      } catch (err) {

        console.log(err);

        toast.error(
          "Failed to load student"
        );
      }
    }

    fetchStudent();

  }, [id]);

  // =========================
  // HANDLE IMAGE
  // =========================
  function handleImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);

    setPreview(
      URL.createObjectURL(file)
    );

    setResult(null);
  }

  // =========================
  // RESET
  // =========================
  function handleReset() {

    setPreview(null);

    setImage(null);

    setResult(null);
  }

  // =========================
  // QUALITY COLOR
  // =========================
  function qualityColor(value: number) {

    if (value >= 80)
      return "bg-green-500";

    if (value >= 60)
      return "bg-yellow-500";

    return "bg-red-500";
  }

  // =========================
  // FACE EXTRACTION
  // =========================
  async function handleUpload() {

    if (!image) {

      toast.error(
        "Please select face image"
      );

      return;
    }

    if (!id) {

      toast.error(
        "Student ID missing"
      );

      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append(
        "student_id",
        id
      );

      formData.append(
        "face_image",
        image
      );

      // =========================
      // API REQUEST
      // =========================
      const res = await api.post(
        "/student/embed/",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setResult(res.data);

      if (res.data.accepted) {
        toast.success(
          "Face template registered successfully"
        );

      } else {

        toast.error(
          "Low quality face discarded"
        );
      }

    } catch (err) {

      console.log(err);

      toast.error(
        "Face extraction failed"
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <div className="
      w-full flex justify-center p-4
    ">

      <div className="
        w-full max-w-5xl
      ">

        {/* =========================
            STUDENT INFO
        ========================= */}
        {student && (

          <div
            className="
              card rounded-2xl p-4 mb-6
              shadow-[0_0_30px_5px_rgba(0,0,0,0.08)]
            "
          >

            <div className="
              flex items-center gap-4
            ">

              {/* IMAGE */}
              <div
                className="
                  w-16 h-16 rounded-full
                  overflow-hidden
                  bg-blue-500/10
                  flex items-center justify-center
                  shrink-0
                "
              >

                {student.student_profile_image ? (

                  <img
                    src={
                      student.student_profile_image
                    }
                    className="
                      w-full h-full object-cover
                    "
                  />

                ) : (

                  <ScanFace
                    className="
                      w-7 h-7 text-blue-500
                    "
                  />
                )}
              </div>

              {/* INFO */}
              <div className="flex-1">

                <h2
                  className="
                    text-lg font-semibold
                  "
                >
                  {student.first_name}{" "}
                  {student.last_name}
                </h2>

                <p
                  className="
                    text-sm text-gray-500
                  "
                >
                  {
                    student.registration_number
                  }
                </p>

                <p
                  className="
                    text-xs text-blue-500 mt-1
                  "
                >
                  {student.program_name}
                </p>
              </div>

              {/* BADGE */}
              <div
                className="
                  px-3 py-1 rounded-full
                  bg-green-500/10
                  text-green-600
                  text-xs font-medium
                "
              >
                Face Registration
              </div>
            </div>
          </div>
        )}

        {/* =========================
            MAIN CONTENT
        ========================= */}
        <div className="
          grid grid-cols-1
          lg:grid-cols-2 gap-6
        ">

          {/* =========================
              LEFT SIDE
          ========================= */}
          <div
            className="
              card rounded-2xl p-6
              shadow-[0_0_30px_5px_rgba(0,0,0,0.08)]
            "
          >

            {/* IMAGE AREA */}
            <div>

              <div
                className="
                  w-full h-[350px]
                  border-2 border-dashed
                  border-gray-300
                  dark:border-gray-700
                  rounded-2xl
                  flex flex-col
                  items-center
                  justify-center
                  overflow-hidden
                  relative
                "
              >

                {preview ? (

                  <img
                    src={preview}
                    className="
                      w-full h-full
                      object-cover
                    "
                  />

                ) : (

                  <div className="
                    text-center
                  ">

                    <div
                      className="
                        w-20 h-20 rounded-full
                        bg-blue-500/10
                        flex items-center
                        justify-center
                        mx-auto
                      "
                    >

                      <Camera
                        className="
                          w-10 h-10
                          text-blue-500
                        "
                      />
                    </div>

                    <p
                      className="
                        mt-4 text-sm
                        text-gray-500
                      "
                    >
                      Upload clear face image
                    </p>
                  </div>
                )}
              </div>

              {/* FILE INPUT */}
              <input
                type="file"
                hidden
                accept="image/*"
                ref={fileRef}
                onChange={handleImage}
              />

              {/* BUTTONS */}
              <div
                className="
                  grid grid-cols-2
                  gap-3 mt-5
                "
              >

                {/* SELECT IMAGE */}
                <button
                  type="button"
                  onClick={() =>
                    fileRef.current?.click()
                  }
                  className="
                    py-3 rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    flex items-center
                    justify-center gap-2
                    transition
                  "
                >

                  <Upload
                    className="
                      w-4 h-4
                    "
                  />

                  Select Image
                </button>

                {/* RESET */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="
                    py-3 rounded-xl
                    border border-gray-300
                    dark:border-gray-700
                    flex items-center
                    justify-center gap-2
                    hover:bg-gray-100
                    dark:hover:bg-gray-800
                    transition
                  "
                >

                  <RotateCcw
                    className="
                      w-4 h-4
                    "
                  />

                  Reset
                </button>
              </div>

              {/* EXTRACT BUTTON */}
              <button
                onClick={handleUpload}
                disabled={loading}
                className="
                  w-full mt-4 py-4
                  rounded-xl
                  bg-green-600
                  hover:bg-green-700
                  text-white
                  font-semibold
                  transition
                  shadow-lg
                  shadow-green-500/20
                "
              >

                {loading
                  ? "Extracting Face Template..."
                  : "Extract Face Template"}
              </button>
            </div>
          </div>

          {/* =========================
              RESULT SIDE
          ========================= */}
          <div
            className="
              card rounded-2xl p-6
              shadow-[0_0_30px_5px_rgba(0,0,0,0.08)]
            "
          >

            <h2
              className="
                text-lg font-semibold
                mb-6
              "
            >
              Extraction Result
            </h2>

            {!result ? (

              <div
                className="
                  h-full flex flex-col
                  items-center
                  justify-center
                  text-center
                "
              >

                <div
                  className="
                    w-20 h-20 rounded-full
                    bg-gray-200
                    dark:bg-gray-800
                    flex items-center
                    justify-center
                  "
                >

                  <ScanFace
                    className="
                      w-10 h-10
                      text-gray-400
                    "
                  />
                </div>

                <p
                  className="
                    mt-4 text-gray-500
                  "
                >
                  No extraction result yet
                </p>
              </div>

            ) : (

              <div className="
                space-y-6
              ">

                {/* STATUS */}
                <div
                  className={`
                    flex items-center gap-3
                    p-4 rounded-2xl
                    ${
                      result.accepted
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >

                  {result.accepted ? (

                    <CheckCircle2
                      className="
                        w-6 h-6
                      "
                    />

                  ) : (

                    <AlertTriangle
                      className="
                        w-6 h-6
                      "
                    />
                  )}

                  <div>

                    <h3 className="
                      font-semibold
                    ">

                      {result.accepted
                        ? "Template Accepted"
                        : "Template Rejected"}
                    </h3>

                    <p className="
                      text-sm
                    ">
                      {result.message}
                    </p>
                  </div>
                </div>

                {/* QUALITY */}
                <div>

                  <div
                    className="
                      flex justify-between
                      mb-2
                    "
                  >

                    <span className="
                      font-medium
                    ">
                      Face Quality
                    </span>

                    <span>
                      {result.quality}%
                    </span>
                  </div>

                  <div
                    className="
                      w-full h-3
                      rounded-full
                      bg-gray-200
                      overflow-hidden
                    "
                  >

                    <div
                      className={`
                        h-full rounded-full
                        ${qualityColor(result.quality)}
                      `}
                      style={{
                        width: `${result.quality}%`,
                      }}
                    />
                  </div>
                </div>

                {/* ACCURACY */}
                <div>

                  <div
                    className="
                      flex justify-between
                      mb-2
                    "
                  >

                    <span className="
                      font-medium
                    ">
                      Recognition Accuracy
                    </span>

                    <span>
                      {result.accuracy}%
                    </span>
                  </div>

                  <div
                    className="
                      w-full h-3
                      rounded-full
                      bg-gray-200
                      overflow-hidden
                    "
                  >

                    <div
                      className={`
                        h-full rounded-full
                        ${qualityColor(result.accuracy)}
                      `}
                      style={{
                        width: `${result.accuracy}%`,
                      }}
                    />
                  </div>
                </div>

                {/* SECURITY */}
                <div
                  className="
                    p-4 rounded-2xl
                    bg-blue-500/10
                  "
                >

                  <div
                    className="
                      flex items-center gap-3
                    "
                  >

                    <ShieldCheck
                      className="
                        w-6 h-6
                        text-blue-500
                      "
                    />

                    <div>

                      <h3 className="
                        font-semibold
                      ">
                        Embedding Verification
                      </h3>

                      <p
                        className="
                          text-sm text-gray-500
                        "
                      >
                        Backend verified facial
                        embedding integrity and
                        recognition confidence
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}