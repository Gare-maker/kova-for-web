import { KovaHeader } from "@/components/KovaHeader";

export default function RootLoading() {
  return (
    <>
      <KovaHeader />
      <main className="ref-storefront">
        <div
          style={{
            padding: "0.75rem 0 0.95rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#f1f2f5" }} />
          <div style={{ width: 104, height: 12, borderRadius: 6, background: "#f1f2f5" }} />
          <div style={{ width: 84, height: 10, borderRadius: 6, background: "#f1f2f5" }} />
        </div>
        <div className="container" style={{ paddingTop: "0.35rem" }}>
          <div style={{ height: 36, maxWidth: 440, margin: "0 auto", borderRadius: 999, background: "#f3f4f6" }} />
          <div className="ref-listing-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n}>
                <div style={{ aspectRatio: "1 / 1", borderRadius: 12, background: "#f3f4f6" }} />
                <div style={{ height: 11, width: "75%", marginTop: 8, borderRadius: 5, background: "#f3f4f6" }} />
                <div style={{ height: 9, width: "55%", marginTop: 5, borderRadius: 5, background: "#f3f4f6" }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
