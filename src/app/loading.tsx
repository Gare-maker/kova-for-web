import { KovaHeader } from "@/components/KovaHeader";

export default function RootLoading() {
  return (
    <>
      <KovaHeader />
      <main className="ref-storefront">
        <div
          style={{
            padding: "1.2rem 0 1.05rem",
            borderBottom: "1px solid #eceef2",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.45rem",
          }}
        >
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f1f2f5" }} />
          <div style={{ width: 120, height: 14, borderRadius: 6, background: "#f1f2f5" }} />
          <div style={{ width: 96, height: 11, borderRadius: 6, background: "#f1f2f5" }} />
        </div>
        <div className="container" style={{ paddingTop: "1rem" }}>
          <div style={{ height: 40, maxWidth: 560, margin: "0 auto", borderRadius: 12, background: "#f3f4f6" }} />
          <div className="ref-listing-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n}>
                <div style={{ aspectRatio: "1 / 1.02", borderRadius: 12, background: "#f3f4f6" }} />
                <div style={{ height: 12, width: "75%", marginTop: 8, borderRadius: 5, background: "#f3f4f6" }} />
                <div style={{ height: 10, width: "55%", marginTop: 5, borderRadius: 5, background: "#f3f4f6" }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
