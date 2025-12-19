import PagoForm from "../components/pagos/PagoForm";
import { useSearchParams } from "react-router-dom";

export default function Pagos() {
  const [params] = useSearchParams();
  const ordenId = params.get("orden");

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Registrar pago</h1>
      <PagoForm ordenId={ordenId} />
    </div>
  );
}
