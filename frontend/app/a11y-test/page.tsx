export default function A11yTest() {
  return (
    <div>
      <h1>A11y Test</h1>

      {/* ALT'siz resim → zorunlu WCAG hatası */}
      <img src="/test.png" />

      {/* Boş buton → WCAG hatası */}
      <button></button>

      {/* Düşük kontrast → WCAG hatası */}
      <p style={{ color: "#cfcfcf", background: "#ffffff" }}>
        Bu metin düşük kontrastlıdır.
      </p>
    </div>
  );
}
