import {
  Monitor,
  Plus,
  Wifi,
  WifiOff,
  Copy,
  Check,
  X,
  Pencil,
  Trash2,
  KeyRound,
  MapPin,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/axios";

type Venue = {
  id: string;
  name: string;
  capacity: number;
};

type Device = {
  id: string;
  device_id: string;
  name: string;
  venue: string;
  venue_name: string;
  is_active: boolean;
  last_seen_at: string | null;
  updated_at: string;
};

const emptyForm = {
  device_id: "",
  name: "",
  venue: "",
  is_active: true,
};

export default function DevicePage() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState<Device[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  // shown exactly once, right after a device is created
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function loadDevices() {
    try {
      setLoading(true);
      const res = await api.get("/devices/");
      setDevices(res.data);
    } catch (e) {
      console.log(e);
      toast.error("Failed to load devices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();

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

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.device_id || !formData.venue) {
      toast.error("Device ID and venue are required");
      return;
    }

    try {
      setSaving(true);

      const res = await api.post("/devices/", formData);

      toast.success("Device registered");

      // this is the only time the api_key will ever be visible
      setNewApiKey(res.data.api_key);

      setFormData(emptyForm);
      setShowCreate(false);

      loadDevices();
    } catch (err: any) {
      console.log(err);
      toast.error(
        err?.response?.data?.device_id?.[0] ||
          err?.response?.data?.error ||
          "Failed to register device"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(device: Device) {
    try {
      await api.put(`/devices/${device.id}/`, {
        is_active: !device.is_active,
      });

      setDevices((prev) =>
        prev.map((d) =>
          d.id === device.id ? { ...d, is_active: !d.is_active } : d
        )
      );

      toast.success(
        device.is_active ? "Device disabled" : "Device enabled"
      );
    } catch (e) {
      console.log(e);
      toast.error("Failed to update device");
    }
  }

  async function handleDelete(device: Device) {
    const confirmed = window.confirm(
      `Remove device "${device.name || device.device_id}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/devices/${device.id}/`);
      toast.success("Device removed");
      setDevices((prev) => prev.filter((d) => d.id !== device.id));
    } catch (e) {
      console.log(e);
      toast.error("Failed to remove device");
    }
  }

  function copyKey() {
    if (!newApiKey) return;
    navigator.clipboard.writeText(newApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatLastSeen(value: string | null) {
    if (!value) return "Never";

    const diffMs = Date.now() - new Date(value).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return new Date(value).toLocaleDateString();
  }

  return (
    <div className="w-full p-4 space-y-6">

      {/* HEADER */}
      <div className="card rounded-2xl p-6 shadow-[0_0_30px_5px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Monitor className="w-7 h-7 text-blue-500" />
              Devices
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Recognition devices, one per venue, each authenticated by its own API key
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="
              flex items-center justify-center gap-2
              bg-blue-600 hover:bg-blue-700
              text-white px-5 py-3 rounded-xl
              shadow-lg shadow-blue-500/20
              transition
            "
          >
            <Plus className="w-4 h-4" />
            Add Device
          </button>
        </div>
      </div>

      {/* API KEY REVEAL (one time only) */}
      {newApiKey && (
        <div className="card rounded-2xl p-6 shadow-[0_0_30px_5px_rgba(0,0,0,0.08)] border-2 border-blue-500/40">
          <div className="flex items-start gap-3">
            <KeyRound className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold">Device API key</h3>
              <p className="text-sm text-gray-500 mt-1">
                Copy this into the device's config now — for security it will
                never be shown again through this dashboard.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm break-all">
                  {newApiKey}
                </code>

                <button
                  onClick={copyKey}
                  className="
                    p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700
                    text-white shrink-0 transition
                  "
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => setNewApiKey(null)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CREATE FORM */}
      {showCreate && (
        <div className="card rounded-2xl p-6 shadow-[0_0_30px_5px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Register New Device</h2>
            <button
              onClick={() => setShowCreate(false)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-1">
                <label className="text-sm font-medium">Device ID</label>
                <input
                  name="device_id"
                  value={formData.device_id}
                  onChange={handleChange}
                  placeholder="e.g. gate-scanner-01"
                  className="input w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Display Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Main Hall Scanner"
                  className="input w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Venue</label>
                <select
                  name="venue"
                  value={formData.venue}
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

            <button
              type="submit"
              disabled={saving}
              className="
                w-full py-3 rounded-xl
                bg-blue-600 hover:bg-blue-700
                text-white font-medium transition
                disabled:opacity-70
              "
            >
              {saving ? "Registering..." : "Register Device"}
            </button>
          </form>
        </div>
      )}

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block overflow-hidden rounded-2xl card shadow-[0_0_30px_5px_rgba(0,0,0,0.08)]">
        <table className="w-full">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr className="text-left text-sm">
              <th className="p-4">Device</th>
              <th className="p-4">Venue</th>
              <th className="p-4">Status</th>
              <th className="p-4">Last Seen</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading && devices.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No devices registered yet
                </td>
              </tr>
            )}

            {devices.map((device) => (
              <tr
                key={device.id}
                className="
                  border-b border-gray-200 dark:border-gray-700
                  hover:bg-gray-100/40 dark:hover:bg-gray-800/40
                  transition
                "
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="font-semibold">
                        {device.name || device.device_id}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {device.device_id}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {device.venue_name}
                  </div>
                </td>

                <td className="p-4">
                  <button
                    onClick={() => handleToggleActive(device)}
                    className={`
                      inline-flex items-center gap-2
                      px-3 py-1 rounded-full text-sm transition
                      ${
                        device.is_active
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }
                    `}
                  >
                    {device.is_active ? (
                      <Wifi className="w-4 h-4" />
                    ) : (
                      <WifiOff className="w-4 h-4" />
                    )}
                    {device.is_active ? "Active" : "Disabled"}
                  </button>
                </td>

                <td className="p-4 text-sm text-gray-500">
                  {formatLastSeen(device.last_seen_at)}
                </td>

                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/devices/edit/${device.id}`)
                      }
                      className="p-2 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition"
                    >
                      <Pencil className="w-4 h-4 text-yellow-500" />
                    </button>

                    <button
                      onClick={() => handleDelete(device)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
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
      <div className="lg:hidden space-y-4">
        {devices.map((device) => (
          <div
            key={device.id}
            className="card rounded-2xl p-4 shadow-[0_0_30px_5px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Monitor className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="font-bold">
                    {device.name || device.device_id}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {device.device_id}
                  </p>
                  <p className="text-sm mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {device.venue_name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleToggleActive(device)}
                className={`
                  inline-flex items-center gap-1
                  px-2 py-1 rounded-full text-xs shrink-0
                  ${
                    device.is_active
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }
                `}
              >
                {device.is_active ? (
                  <Wifi className="w-3.5 h-3.5" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5" />
                )}
                {device.is_active ? "Active" : "Off"}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Last seen: {formatLastSeen(device.last_seen_at)}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigate(`/admin/devices/edit/${device.id}`)
                  }
                  className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(device)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!loading && devices.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No devices registered yet
          </div>
        )}
      </div>
    </div>
  );
}
