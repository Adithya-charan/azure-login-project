export default function Loading() {
  return <div className="container" aria-label="Loading content" aria-busy="true" style={{ paddingBlock: 60 }}>
    <div style={{ width: 170, height: 12, marginBottom: 18, background: "#e5e9df", borderRadius: 4 }} />
    <div style={{ width: "min(420px, 80%)", height: 38, marginBottom: 28, background: "#e5e9df", borderRadius: 4 }} />
    <div className="product-grid">{Array.from({ length: 4 }, (_, index) => <div key={index}><div style={{ aspectRatio: "1 / 1.08", background: "#e9ede5", borderRadius: 6 }} /><div style={{ width: "70%", height: 12, marginTop: 14, background: "#e5e9df", borderRadius: 4 }} /><div style={{ width: "40%", height: 12, marginTop: 8, background: "#e5e9df", borderRadius: 4 }} /></div>)}</div>
  </div>;
}