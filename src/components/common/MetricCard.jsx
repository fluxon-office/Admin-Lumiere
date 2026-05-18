function MetricCard({ label, value, detail, tone, marker }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{marker} {label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export default MetricCard;
