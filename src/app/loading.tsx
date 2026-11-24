import { KovaHeader } from "@/components/KovaHeader";

export default function RootLoading() {
  return (
    <>
      <KovaHeader />
      <main className="ref-storefront">
        <div
          style={{
            height: 185,
            background: "linear-gradient(125deg, rgba(44,155,67,0.82), rgba(28,128,52,0.78))",
          }}
        />
        <div className="container" style={{ paddingTop: "1.5rem" }}>
          <div style={{ height: 50, maxWidth: 680, margin: "0 auto", borderRadius: 12, background: "#f3f4f6" }} />
          <div className="ref-listing-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n}>
                <div style={{ aspectRatio: "1 / 1.06", borderRadius: 16, background: "#f3f4f6" }} />
                <div style={{ height: 14, width: "75%", marginTop: 10, borderRadius: 6, background: "#f3f4f6" }} />
                <div style={{ height: 12, width: "55%", marginTop: 6, borderRadius: 6, background: "#f3f4f6" }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

