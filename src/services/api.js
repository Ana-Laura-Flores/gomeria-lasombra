export const API_URL = import.meta.env.VITE_API_URL;

// --------------------
// Headers de autenticación
// --------------------
export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// --------------------
// Fetch genérico
// --------------------
export const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API_URL}/items/${endpoint}`, {
    cache: "no-store", // 👈 ACÁ
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Error al llamar a API: ${res.statusText}`);
  }

  return res.json();
};


// --------------------
// Tarifas (para tipos de vehículo y precios)
// --------------------
export const getTarifas = async () => {
  return apiFetch(
    "tarifas?fields=id,precio,tipo_vehiculo,servicio.id,servicio.nombre"
  );
};

// --------------------
// Items de orden
// --------------------
export const getItemsOrden = async () => {
  return apiFetch(
    "items_orden?fields=*,tarifa.id,tarifa.precio,tarifa.tipo_vehiculo,tarifa.servicio.id,tarifa.servicio.nombre"
  );
};

// --------------------
// Servicios con tarifas
// --------------------
export const getServicios = async () => {
  return apiFetch(
    "servicios?fields=*,tarifas.id,tarifas.precio,tarifas.tipo_vehiculo"
  );
};

// --------------------
// Clientes
// --------------------
export const getClientes = async () => {
  return apiFetch(
    "clientes?fields=id,nombre,apellido,telefono,email"
  );
};

export const getOrdenesTrabajo = async () => {
  return apiFetch(
    "ordenes_trabajo?fields=*,cliente.*,pagos.*,items_orden.*"
  );
};


export const getOrdenTrabajoById = async (id) => {
  return apiFetch(
    `ordenes_trabajo/${id}?fields=*, cliente.id,cliente.nombre,pagos.*,items_orden.*,items_orden.tarifa.servicio.nombre`
  );
};

// --------------------
// Último comprobante
// --------------------
export const getUltimoComprobante = async () => {
  const res = await apiFetch(
    "ordenes_trabajo?fields=comprobante&sort=-comprobante&limit=1"
  );
  return res.data[0]?.comprobante || null;
};

export const generarNumeroComprobante = async () => {
  const ultimo = await getUltimoComprobante();
  let siguiente = 1;
  if (ultimo) {
    siguiente = Number(ultimo) + 1;
  }
  return String(siguiente).padStart(6, "0"); // Ej: 000001
};


export const getDashboardOrdenes = async (desde, hasta) => {
  return apiFetch(
    `ordenes_trabajo?fields=id,total,total_pagado,saldo,fecha&filter[fecha][_between]=${desde},${hasta}`
  );
};


export const getOrdenesCuentaCorriente = async (clienteId) => {
  if (!clienteId) return { data: [] };

  return apiFetch(
    `ordenes_trabajo?fields=id,fecha,total,comprobante&filter[cliente][_eq]=${clienteId}&filter[condicion_cobro][_eq]=cuenta_corriente`
  );
};



// Traer todas las órdenes para cuenta corriente
export const getCuentasCorrientes = async () => {
  return apiFetch(
    "cuenta_corriente?fields=id,saldo,total_ordenes,total_pagos,saldo_actualizado,cliente&filter[activa][_eq]=true"
  );
};


export const getCuentaCorrienteByCliente = async (clienteId) => {
  if (!clienteId) return { data: [] };

  return apiFetch(
    `cuenta_corriente?filter[cliente][_eq]=${clienteId}&limit=1`
  );
};




//Pagos por cliente
export const getPagosCuentaCorriente = async (clienteId) => {
  if (!clienteId) return { data: [] };

  return apiFetch(
    `pagos?filter[cliente][_eq]=${clienteId}&filter[estado][_eq]=confirmado&fields=*,cliente.*,orden.*`
  );
};


export const crearCuentaCorriente = async ({ cliente, saldo_inicial = 0 }) => {
  const res = await fetch(`${API_URL}/items/cuenta_corriente`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      cliente,
      saldo: saldo_inicial,
      total_pagos: 0,
      total_ordenes: 0,
      saldo_actualizado: saldo_inicial,
      activa: true
    }),
  });

  if (!res.ok) throw new Error("No se pudo crear la cuenta corriente");

  const data = await res.json();
  return data.data; // devuelve todo el objeto creado
};
 


export const impactarPagoEnCuentaCorriente = async (clienteId, monto) => {
  let ccRes = await getCuentaCorrienteByCliente(clienteId);
  let cc = ccRes.data[0];

  if (!cc) {
    // crear cuenta automáticamente si no existe
    cc = await crearCuentaCorriente({ cliente: clienteId });
  }

  return actualizarCuentaCorriente(cc.id, {
    total_pagos: Number(cc.total_pagos || 0) + Number(monto),
    saldo: Number(cc.saldo || 0) - Number(monto),
    saldo_actualizado: Number(cc.saldo_actualizado || 0) - Number(monto),
  });
};


export const actualizarCuentaCorriente = async (id, data) => {
  return apiFetch(`cuenta_corriente/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};


export const getClienteById = async (id) => {
  return apiFetch(`clientes/${id}?fields=id,saldo_cc`);
};

export const actualizarCliente = async (id, data) => {
  return apiFetch(`clientes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};



// --------------------
export const crearPago = async (pago) => {
  return apiFetch("pagos", {
    method: "POST",
    body: JSON.stringify({
      orden: pago.orden,       // ID
      cliente: pago.cliente,   // ID
      metodo_pago: pago.metodo_pago,
      monto: Number(pago.monto),
      fecha: pago.fecha || new Date().toISOString(),
      observaciones: pago.observaciones || "",
      estado: "confirmado",
      banco: pago.banco || null,
      numero_cheque: pago.numero_cheque || null,
      fecha_cobro: pago.fecha_cobro || null,
    }),
  });
};


// Traer pagos de una orden
export const getPagosByOrden = async (ordenId) => {
  return apiFetch(
    `pagos?filter[orden][_eq]=${ordenId}&fields=*,orden.id`
  );
};


export const actualizarOrden = async (id, data) => {
  return apiFetch(`ordenes_trabajo/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const getPagosPorMes = async (desde, hasta) => {
  return apiFetch(
    `pagos?filter[fecha][_between]=${desde},${hasta}&fields=*,cliente.*,orden.*`
  );
};


// services/api.js
export const getMetodosPagoField = async () => {
  const res = await fetch(
    `${API_URL}/fields/pagos/metodo_pago`,
    {
      headers: authHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Error al cargar métodos de pago");
  }

  const json = await res.json();

  return json.data.meta?.options?.choices || [];
};

// GASTOS
export const getGastos = async () =>
  apiFetch("gastos?sort=-fecha&fields=*,categoria.nombre");

export const crearGasto = async (data) =>
  apiFetch("gastos", { method: "POST", body: JSON.stringify(data) });

export const getCategoriasGasto = async () =>
  apiFetch("categorias_gasto?filter[activo][_eq]=true");

export const getGastosPrefijados = async () =>
  apiFetch("gastos_prefijados?filter[activo][_eq]=true");

export const getGastosPorMes = async (desde, hasta) => {
  return apiFetch(
    `gastos?fields=id,monto,fecha,metodo_pago&filter[fecha][_between][]=${desde}T00:00:00&filter[fecha][_between][]=${hasta}T23:59:59`
  );
};




