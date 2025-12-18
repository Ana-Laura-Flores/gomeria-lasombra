export function Card({ title, value }) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
