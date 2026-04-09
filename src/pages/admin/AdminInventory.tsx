import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Toast from "../../components/Toast";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "../../api/inventory";
import type { InventoryItem, CreateInventoryPayload } from "../../api/inventory";

const inputStyle: React.CSSProperties = { width: "100%", height: 48, padding: "0 14px", background: "#0C0C0C", border: "1.5px solid #2E2E2E", borderRadius: 12, color: "#FFF", fontSize: 14, outline: "none", fontFamily: "inherit" };
const labelStyle: React.CSSProperties = { color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 6, display: "block" };

const AdminInventory = () => {
  const [items, setItems]         = useState<InventoryItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editQty, setEditQty]     = useState<{ id: string; val: string } | null>(null);
  const [saving, setSaving]       = useState(false);

  const [form, setForm] = useState({ name: "", sku: "", description: "", quantity: "", unit: "pcs" });
  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const showToast = (msg: string, ok: boolean) => setToast({ msg, ok });

  const fetchItems = useCallback(async () => {
    try { setLoading(true); setError(null); const d = await getInventory(); setItems(d); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.sku.trim()) return;
    setSaving(true);
    try {
      const payload: CreateInventoryPayload = { name: form.name, sku: form.sku, companyId: 1, description: form.description || undefined, quantity: Number(form.quantity) || 0, unit: form.unit || "pcs", isActive: true };
      const created = await createInventoryItem(payload);
      setItems((p) => [...p, created]);
      showToast("Item creado", true);
      setShowForm(false);
      setForm({ name: "", sku: "", description: "", quantity: "", unit: "pcs" });
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Error", false); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    try { await deleteInventoryItem(confirmId); setItems((p) => p.filter((i) => i.id !== confirmId)); showToast("Item eliminado", true); }
    catch (e: unknown) { showToast(e instanceof Error ? e.message : "Error", false); }
    finally { setConfirmId(null); }
  };

  const handleUpdateQty = async () => {
    if (!editQty) return;
    try {
      await updateInventoryItem(editQty.id, { quantity: Number(editQty.val) });
      setItems((p) => p.map((i) => i.id === editQty.id ? { ...i, quantity: Number(editQty.val) } : i));
      showToast("Cantidad actualizada", true);
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Error", false); }
    finally { setEditQty(null); }
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || (i.sku ?? "").toLowerCase().includes(q) || (i.description ?? "").toLowerCase().includes(q);
  });

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout>
      {toast && <Toast message={toast.msg} type={toast.ok ? "success" : "error"} onDismiss={() => setToast(null)} />}
      {confirmId && <ConfirmDialog title="Eliminar item" message="¿Seguro que deseas eliminar este item?" onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
      {showForm && (
        <Modal title="Nuevo Item" onClose={() => setShowForm(false)} onSave={handleCreate} saveLabel="Crear Item" saving={saving}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "12px 0" }}>
            <div><label style={labelStyle}>NOMBRE *</label><input value={form.name} onChange={setF("name")} placeholder="e.g. HDMI Cable" style={inputStyle} /></div>
            <div><label style={labelStyle}>SKU / CÓDIGO *</label><input value={form.sku} onChange={setF("sku")} placeholder="e.g. CAB-HDMI-01" style={inputStyle} /></div>
            <div><label style={labelStyle}>DESCRIPCIÓN</label><input value={form.description} onChange={setF("description")} placeholder="Descripción" style={inputStyle} /></div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>CANTIDAD</label><input value={form.quantity} onChange={setF("quantity")} type="number" min="0" placeholder="0" style={inputStyle} /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>UNIDAD</label><input value={form.unit} onChange={setF("unit")} placeholder="pcs" style={inputStyle} /></div>
            </div>
          </div>
        </Modal>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#FFF", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Inventario</h1>
            <p style={{ color: "#555", fontSize: 13 }}>{filtered.length} de {items.length} items</p>
            {error && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>API error: {error}</p>}
          </div>
          <button onClick={() => setShowForm(true)} style={{ padding: "10px 20px", borderRadius: 12, background: "#22C55E", border: "none", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Nuevo Item</button>
        </div>

        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, SKU..." style={{ height: 42, padding: "0 14px", background: "#111", border: "1px solid #1F1F1F", borderRadius: 10, color: "#FFF", fontSize: 13, outline: "none", fontFamily: "inherit" }} />

        {filtered.length === 0 ? (
          <EmptyState title="Sin items" subtitle="Agrega tu primer item al inventario." actionLabel="Nuevo Item" onAction={() => setShowForm(true)} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px", gap: 12, padding: "8px 16px", color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>
              <span>NOMBRE</span><span>SKU</span><span>CANTIDAD</span><span>UNIDAD</span><span></span>
            </div>
            {filtered.map((item) => (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px", gap: 12, padding: "14px 16px", background: "#111", border: "1px solid #1F1F1F", borderRadius: 12, alignItems: "center" }}>
                <div>
                  <div style={{ color: "#FFF", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.name}</div>
                  <div style={{ color: "#555", fontSize: 11 }}>{item.description ?? ""}</div>
                </div>
                <div style={{ color: "#A1A1A1", fontSize: 13 }}>{item.sku ?? "—"}</div>
                <div>
                  {editQty?.id === item.id ? (
                    <input
                      value={editQty.val}
                      onChange={(e) => setEditQty({ id: item.id, val: e.target.value })}
                      onBlur={handleUpdateQty}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdateQty()}
                      autoFocus
                      type="number"
                      style={{ width: 70, height: 32, padding: "0 8px", background: "#0C0C0C", border: "1px solid #22C55E", borderRadius: 8, color: "#FFF", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    />
                  ) : (
                    <span onClick={() => setEditQty({ id: item.id, val: String(item.quantity ?? 0) })} style={{ color: "#FFF", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline dotted #555" }}>
                      {item.quantity ?? 0}
                    </span>
                  )}
                </div>
                <div style={{ color: "#A1A1A1", fontSize: 13 }}>{item.unit ?? "pcs"}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditQty({ id: item.id, val: String(item.quantity ?? 0) })} style={{ flex: 1, height: 30, borderRadius: 8, border: "1px solid #2A2A2A", background: "none", color: "#22C55E", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                  <button onClick={() => setConfirmId(item.id)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #2D0A0A", background: "none", color: "#EF4444", fontSize: 14, cursor: "pointer" }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
