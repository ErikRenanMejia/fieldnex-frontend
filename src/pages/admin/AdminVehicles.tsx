import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Toast from "../../components/Toast";
import Modal from "../../components/Modal";
import { getVehicles, createVehicle, getVehicleLogs } from "../../api/vehicles";
import type { Vehicle, VehicleLog } from "../../api/vehicles";

const STATUS_CFG: Record<Vehicle["status"], { color: string; bg: string }> = {
  active:      { color: "#22C55E", bg: "#052E16" },
  inactive:    { color: "#555",    bg: "#1A1A1A" },
  maintenance: { color: "#F59E0B", bg: "#1C1200" },
};

const inputStyle: React.CSSProperties = { width: "100%", height: 48, padding: "0 14px", background: "#0C0C0C", border: "1.5px solid #2E2E2E", borderRadius: 12, color: "#FFF", fontSize: 14, outline: "none", fontFamily: "inherit" };
const labelStyle: React.CSSProperties = { color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 6, display: "block" };

const AdminVehicles = () => {
  const [vehicles, setVehicles]   = useState<Vehicle[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [logsVehicle, setLogsVehicle] = useState<{ vehicle: Vehicle; logs: VehicleLog[] } | null>(null);
  const [form, setForm] = useState({ plate: "", model: "", status: "active" });
  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const fetchVehicles = useCallback(async () => {
    try { setLoading(true); setError(null); const d = await getVehicles(); setVehicles(d); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleCreate = async () => {
    if (!form.plate.trim() || !form.model.trim()) return;
    setSaving(true);
    try {
      const created = await createVehicle({ ...form, status: form.status as Vehicle["status"] });
      setVehicles((p) => [...p, created]);
      setToast({ msg: "Vehículo creado", ok: true });
      setShowForm(false);
      setForm({ plate: "", model: "", status: "active" });
    } catch (e: unknown) { setToast({ msg: e instanceof Error ? e.message : "Error", ok: false }); }
    finally { setSaving(false); }
  };

  const openLogs = async (v: Vehicle) => {
    try { const logs = await getVehicleLogs(v.id); setLogsVehicle({ vehicle: v, logs }); }
    catch { setLogsVehicle({ vehicle: v, logs: [] }); }
  };

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout>
      {toast && <Toast message={toast.msg} type={toast.ok ? "success" : "error"} onDismiss={() => setToast(null)} />}
      {showForm && (
        <Modal title="Nuevo Vehículo" onClose={() => setShowForm(false)} onSave={handleCreate} saveLabel="Crear Vehículo" saving={saving}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "12px 0" }}>
            <div><label style={labelStyle}>PLACA *</label><input value={form.plate} onChange={setF("plate")} placeholder="ABC-1234" style={inputStyle} /></div>
            <div><label style={labelStyle}>MODELO *</label><input value={form.model} onChange={setF("model")} placeholder="Toyota Hilux 2022" style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>ESTADO</label>
              <select value={form.status} onChange={setF("status")} style={{ ...inputStyle, appearance: "none" }}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="maintenance">En mantenimiento</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
      {logsVehicle && (
        <Modal title={`Logs — ${logsVehicle.vehicle.plate}`} onClose={() => setLogsVehicle(null)}>
          <div style={{ padding: "8px 0 12px", display: "flex", flexDirection: "column", gap: 10 }}>
            {logsVehicle.logs.length === 0 ? (
              <p style={{ color: "#555", fontSize: 13 }}>Sin logs registrados.</p>
            ) : (
              logsVehicle.logs.map((l) => (
                <div key={l.id} style={{ background: "#1A1A1A", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ color: "#FFF", fontSize: 13, fontWeight: 600 }}>{l.date}</div>
                  <div style={{ color: "#A1A1A1", fontSize: 12, marginTop: 4 }}>{l.km} km · {l.notes ?? ""}</div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#FFF", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Vehículos</h1>
            <p style={{ color: "#555", fontSize: 13 }}>{vehicles.length} vehículo{vehicles.length !== 1 ? "s" : ""}</p>
            {error && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>API error: {error}</p>}
          </div>
          <button onClick={() => setShowForm(true)} style={{ padding: "10px 20px", borderRadius: 12, background: "#22C55E", border: "none", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Nuevo</button>
        </div>

        {vehicles.length === 0 ? (
          <EmptyState title="Sin vehículos" subtitle="Agrega tu primer vehículo." actionLabel="Nuevo Vehículo" onAction={() => setShowForm(true)} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {vehicles.map((v) => {
              const cfg = STATUS_CFG[v.status];
              return (
                <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "#111", border: "1px solid #1F1F1F", borderRadius: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#FFF", fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{v.plate}</div>
                    <div style={{ color: "#555", fontSize: 12 }}>{v.model}</div>
                  </div>
                  <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.06em" }}>{v.status.toUpperCase()}</span>
                  <button onClick={() => openLogs(v)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #2A2A2A", background: "none", color: "#A1A1A1", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Ver Logs</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminVehicles;
