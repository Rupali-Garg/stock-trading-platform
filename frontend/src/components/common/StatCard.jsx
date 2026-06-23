const StatCard = ({ label, value, sub, color = 'white' }) => {
  const colors = {
    white:  'text-white',
    green:  'text-green-400',
    red:    'text-red-400',
    blue:   'text-blue-400',
    yellow: 'text-yellow-400',
  };
  return (
    <div className="card">
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
};

export default StatCard;