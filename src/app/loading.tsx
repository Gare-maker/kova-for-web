export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div
        style={{
          height: 52,
          background: "#ffffff",
          borderBottom: "1px solid #eef0f3",
        }}
      />
      <div
        style={{
          background: "linear-gradient(180deg, #2c9b43 0%, #248a3a 100%)",
          padding: "2rem 0 1.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.22)",
          }}
        />
        <div
          style={{
            marginTop: "0.75rem",
            width: 140,
            height: 18,
            borderRadius: 6,
            background: "rgba(255,255,255,0.25)",
          }}
        />
        <div
          style={{
            marginTop: "0.38rem",
            width: 110,
            height: 12,
            borderRadius: 5,
            background: "rgba(255,255,255,0.18)",
          }}
        />
      </div>
      <div
        style={{
          background: "linear-gradient(180deg, #248a3a 0%, #1f7d34 100%)",
          padding: "0.75rem 0 0.9rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "min(520px, calc(100% - 2rem))",
            height: 44,
            borderRadius: 999,
            background: "rgba(255,255,255,0.94)",
          }}
        />
      </div>
      <div className="container" style={{ paddingTop: "1.85rem" }}>
        <div className="ref-listing-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div
                style={{
                  aspectRatio: "1 / 1.06",
                  borderRadius: 12,
                  background: "#f2f3f6",
                }}
              />
              <div
                style={{
                  marginTop: "0.55rem",
                  height: 12,
                  width: "74%",
                  borderRadius: 5,
                  background: "#f2f3f6",
                }}
              />
              <div
                style={{
                  marginTop: "0.28rem",
                  height: 12,
                  width: "46%",
                  borderRadius: 5,
                  background: "#f5f6f8",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
