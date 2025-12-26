import html2pdf from "html2pdf.js";

export function exportarPDFOrden({ elementId, filename }) {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error("Elemento para PDF no encontrado");
    return;
  }

  html2pdf()
    .set({
      margin: 5,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm",
        format: "a5",
        orientation: "portrait",
      },
    })
    .from(element)
    .save();
}
