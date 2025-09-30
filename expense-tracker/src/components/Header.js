// src/components/Header.js
export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#b0c9ebff",
        borderBottom: "1px solid #ddd",
        justifyContent: "center",
      }}
    >
      <img src="/logo.png" alt="SpendSmart" style={{ height: "50px", marginRight: "10px" }} />
      <h1 style={{ color: "#1e3a8a" }}>SpendSmart</h1>
    </header>
  );
}
