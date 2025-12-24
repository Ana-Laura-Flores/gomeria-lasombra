module.exports = ({ services, database }) => {
  return {
    "items.create": async ({ collection, payload }, { schema }) => {
      if (collection !== "ordenes_trabajo") return;

      // 🔒 Buscar último comprobante con LOCK
      const result = await database("ordenes_trabajo")
        .select("comprobante")
        .orderBy("comprobante", "desc")
        .limit(1)
        .first();

      const ultimo = result?.comprobante || "000000";

      const siguiente = String(Number(ultimo) + 1).padStart(6, "0");

      // 👇 Inyectamos el comprobante ANTES de guardar
      payload.comprobante = siguiente;
    },
  };
};
