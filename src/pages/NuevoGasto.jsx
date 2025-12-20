import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Modal from "../components/Modal";
import {
  crearGasto,
  getCategoriasGasto,
  getGastosPrefijados,
} from "../services/api";

export default function NuevoGasto() {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [prefijados, setPrefijados] = useState([]);

  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    concepto: "",
    monto: "",
    tipo: "variable",
    categoria: "",
    observaciones: "",
  });

  const [usarPrefijado, setUsarPrefijado] = useState(false);
  const [prefijadoId, setPrefijadoId] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarData();
  }, []);

  const cargarData = async () => {
    const [catRes, preRes] = await Promise.all([
      getCategoriasGasto(),
      getGastosPrefijados(),
    ]);

    setCategorias(catRes.data);
    setPrefijados(preRes.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePrefijadoSelect = (id) => {
    setPrefijadoId(id);

    const elegido = prefijados.find((p) => p.id === id);
    if (!elegido) return;

    setForm({
      ...form,
      concepto: elegido.nombre,
      monto: elegido.monto_default,
      categoria: elegido.categoria?.id || "",
      tipo: elegido.es_fijo ? "FIJO" : "variable",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      await crearGasto({
        ...form,
        monto: Number(form.monto),
      });

      setModalOpen(true);
    } catch (error) {
      console.error(error);
      alert("Error al guardar gasto");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto p-6 bg-gray-900 rounded">
        <h1 className="text-2xl font-bold mb-6">Nuevo gasto</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PREFIJADO */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={usarPrefijado}
              onChange={(e) => setUsarPrefijado(e.target.checked)}
            />
            Usar gasto prefijado
          </label>

          {usarPrefijado && (
            <select
              className="w-full p-2 rounded bg-gray-800"
              value={prefijadoId}
              onChange={(e) => handlePrefijadoSelect(e.target.value)}
            >
              <option value="">Seleccionar prefijado</option>
              {prefijados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          )}

          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800"
          />

          <input
            type="text"
            name="concepto"
            placeholder="Concepto"
            value={form.concepto}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800"
            required
          />

          <input
            type="number"
            name="monto"
            placeholder="Monto"
            value={form.monto}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800"
            required
          />

          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800"
            required
          >
            <option value="">Categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800"
          >
            <option value="FIJO">FIJO</option>
            <option value="variable">Variable</option>
          </select>

          <textarea
            name="observaciones"
            placeholder="Observaciones"
            value={form.observaciones}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800"
          />

          <button
            disabled={guardando}
            className="w-full bg-green-600 py-2 rounded font-bold"
          >
            Guardar gasto
          </button>
        </form>
      </div>

      {/* MODAL */}
      <Modal
  open={modalOpen}
  title="Gasto guardado"
  onClose={() => navigate("/gastos")}
  actions={
    <button
      onClick={() => navigate("/gastos")}
      className="bg-green-600 px-4 py-2 rounded font-bold"
    >
      Aceptar
    </button>
  }
>
  <p>El gasto se registró correctamente.</p>
</Modal>

    </MainLayout>
  );
}
