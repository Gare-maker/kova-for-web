export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div
        style={{
          background: "linear-gradient(180deg, #2c9b43 0%, #238839 100%)",
          padding: "2.25rem 0 2.1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 82,
            height: 82,
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
        <div
          style={{
            marginTop: "1.35rem",
            width: "min(540px, calc(100% - 2rem))",
            height: 44,
            borderRadius: 999,
            background: "rgba(255,255,255,0.94)",
          }}
        />
      </div>
      <div className="container" style={{ paddingTop: "1.95rem" }}>
        <div className="ref-listing-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                borderRadius: 16,
                border: "1px solid #eef0f3",
                padding: "0.45rem 0.45rem 0.72rem",
              }}
            >
              <div
                style={{
                  aspectRatio: "1 / 1.12",
                  borderRadius: 12,
                  background: "#f2f3f6",
                }}
              />
              <div
                style={{
                  marginTop: "0.6rem",
                  height: 12,
                  width: "74%",
                  borderRadius: 5,
                  background: "#f2f3f6",
                }}
              />
              <div
                style={{
                  marginTop: "0.3rem",
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
