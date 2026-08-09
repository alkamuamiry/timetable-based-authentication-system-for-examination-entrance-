import { useEffect, useState } from "react"
import {
  Users,
  Monitor,
  Fingerprint,
  Building2,
} from "lucide-react"
import { toast } from "sonner";
import api from "../api/axios"

export default function AdminDashboard() {

  const [counts, setCounts] = useState({
    students: 0,
    devices: 0,
    venues: 0,
    faceRecords: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function loadCounts() {
      try {

        const [studentsRes, devicesRes, venuesRes, facesRes] =
          await Promise.all([
            api.get("/students/"),
            api.get("/devices/"),
            api.get("/venues/"),
            api.get("/student/embed/"),
          ])

        setCounts({
          students: studentsRes.data.length,
          devices: devicesRes.data.length,
          venues: venuesRes.data.length,
          faceRecords: facesRes.data.length,
        })

      } catch (e) {

        console.log(e)
        toast.error("Failed to load dashboard data")

      } finally {

        setLoading(false)
      }
    }

    loadCounts()

  }, [])

  const cards = [
    {
      title: "Students",
      value: loading ? "..." : counts.students,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Devices",
      value: loading ? "..." : counts.devices,
      icon: Monitor,
      color: "bg-green-500",
    },
    {
      title: "Venues",
      value: loading ? "..." : counts.venues,
      icon: Building2,
      color: "bg-purple-500",
    },
    {
      title: "Face Records",
      value: loading ? "..." : counts.faceRecords,
      icon: Fingerprint,
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="space-y-6 w-full  ">

      <h1 className="text-2xl font-bold  ">
        Dashboard Overview
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {cards.map((card, i) => {
          const Icon = card.icon

          return (
            <div
              key={i}
              className="card  rounded-xl shadow-sm p-4 flex items-center gap-4 "
            >

              <div className={`p-3 rounded-lg  ${card.color}`}>
                <Icon size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  {card.title}
                </p>
                <h2 className="text-xl font-bold">
                  {card.value}
                </h2>
              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}
