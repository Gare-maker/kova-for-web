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
          background: "linear-gradient(180deg, #2c9b43 0%, #238839 100%)",
          padding: "2rem 0 2.2rem",
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
            marginTop: "0.78rem",
            width: 140,
            height: 18,
            borderRadius: 6,
            background: "rgba(255,255,255,0.25)",
          }}
        />
        <div
          style={{
            marginTop: "0.4rem",
            width: 110,
            height: 12,
            borderRadius: 5,
            background: "rgba(255,255,255,0.18)",
          }}
        />
        <div
          style={{
            marginTop: "1.3rem",
            width: "min(520px, calc(100% - 2rem))",
            height: 44,
            borderRadius: 999,
            background: "rgba(255,255,255,0.92)",
          }}
        />
      </div>
      <div className="container" style={{ paddingTop: "2rem" }}>
        <div className="ref-listing-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div
                style={{
                  aspectRatio: "4 / 3",
                  borderRadius: 10,
                  background: "#f2f3f6",
                }}
              />
              <div
                style={{
                  marginTop: "0.48rem",
                  height: 11,
                  width: "74%",
                  borderRadius: 5,
                  background: "#f2f3f6",
                }}
              />
              <div
                style={{
                  marginTop: "0.26rem",
                  height: 11,
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
