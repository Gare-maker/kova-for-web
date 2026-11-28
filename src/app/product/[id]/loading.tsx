export default function ProductLoading() {
  return (
    <main className="ref-detail-page">
      <div className="ref-detail-shell">
        <div
          style={{
            height: 360,
            borderRadius: 18,
            background: "#f1f2f5",
          }}
        />
        <div
          style={{
            padding: "1.5rem",
            borderRadius: 18,
            border: "1px solid #eef0f3",
            display: "grid",
            gap: "0.9rem",
          }}
        >
          <div style={{ height: 24, width: "65%", background: "#f1f2f5", borderRadius: 8 }} />
          <div style={{ height: 16, width: "45%", background: "#f1f2f5", borderRadius: 8 }} />
          <div style={{ height: 22, width: "35%", background: "#f1f2f5", borderRadius: 8 }} />
          <div style={{ height: 48, width: "100%", background: "#e9f9ed", borderRadius: 10 }} />
        </div>
      </div>
    </main>
  );
}
