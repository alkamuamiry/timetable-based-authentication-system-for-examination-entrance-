import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Monitor, MapPin, Shield, Save, ArrowLeft, Clock } from "lucide-react";
import api from "../api/axios";

type Venue = {
  id: string;
  name: string;
  capacity: number;
};

type DeviceForm = {
  device_id: string;
  name: string;
  venue: string;
  is_active: boolean;
};

const emptyForm: DeviceForm = {
  device_id: "",
  name: "",
  venue: "",
  is_active: true,
};

export default function DeviceSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [settings, setSettings] = useState<DeviceForm>(emptyForm);

  useEffect(() => {
    if (!id) return;

    async function fetchDevice() {
      try {
        setFetching(true);

        const res = await api.get(`/devices/${id}/`);

        setSettings({
          device_id: res.data.device_id,
          name: res.data.name || "",
          venue: res.data.venue,
          is_active: res.data.is_active,
        });

        setLastSeen(res.data.last_seen_at);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load device");
      } finally {
        setFetching(false);
      }
    }

    fetchDevice();
  }, [id]);

  useEffect(() => {
    api
      .get("/venues/")
      .then((res) => setVenues(res.data))
      .catch((e) => {
        console.log(e);
        toast.error("Failed to load venues");
      });
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  }

  async function handleSave() {
    if (!id) return;

    try {
      setLoading(true);

      await api.put(`/devices/${id}/`, settings);

      toast.success("Device updated");
      navigate("/admin/devices");
    } catch (err) {
      console.log(err);
      toast.error("Failed to save device");
    } finally {
      setLoading(false);
    }
  }

  function formatLastSeen(value: string | null) {
    if (!value) return "Never connected";
    return new Date(value).toLocaleString();
  }

  if (fetching) {
    return (
      <div className="w-full flex justify-center p-8 text-gray-500">
        Loading device...
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">

        {/* HEADER */}
        <div className="card p-6 rounded-xl shadow-lg">
          <button
            onClick={() => navigate("/admin/devices")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to devices
          </button>

          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="w-6 h-6 text-blue-500" />
            {settings.name || settings.device_id}
          </h1>

          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last seen: {formatLastSeen(lastSeen)}
          </p>
        </div>

        {/* DEVICE INFO */}
        <div className="card p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Device Info
          </h2>

          <div className="space-y-1">
            <label className="text-sm font-medium">Device ID</label>
            <input
              name="device_id"
              value={settings.device_id}
              onChange={handleChange}
              className="input w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Display Name</label>
            <input
              name="name"
              value={settings.name}
              onChange={handleChange}
              placeholder="e.g. Main Hall Scanner"
              className="input w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Venue
            </label>
            <select
              name="venue"
              value={settings.venue}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3 bg-transparent"
            >
              <option value="">Select venue</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STATUS */}
        <div className="card p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Status
          </h2>

          <label className="flex items-center justify-between">
            Device Active
            <input
              type="checkbox"
              name="is_active"
              checked={settings.is_active}
              onChange={handleChange}
            />
          </label>

          <p className="text-xs text-gray-500">
            Disabling a device immediately blocks it from fetching schedules
            or rosters, even with a valid API key.
          </p>
        </div>

        {/* NOTE ON API KEY */}
        <div className="card p-6 rounded-xl shadow-lg">
          <p className="text-sm text-gray-500">
            For security, the device's API key is only ever shown once, at
            the moment it's created. It can't be viewed here — remove and
            re-register the device if the key needs to be rotated.
          </p>
        </div>

        {/* SAVE BUTTON */}
        <div className="card p-6 rounded-xl shadow-lg flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="
              flex items-center gap-2
              bg-blue-600 hover:bg-blue-700
              text-white px-6 py-3 rounded-xl
              shadow-lg shadow-blue-500/20
              transition disabled:opacity-70
            "
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
