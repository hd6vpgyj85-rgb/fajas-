import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoyalty } from "../../context/LoyaltyContext";
import "./MiTarjetaPage.css";

export default function MiTarjetaPage() {
  const { findTokenByAccess } = useLoyalty();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSearching(true);
    try {
      const token = await findTokenByAccess(phone, code);
      if (!token) {
        setError("No encontramos una tarjeta con ese WhatsApp y código. Revisa los datos e intenta de nuevo.");
        return;
      }
      navigate(`/fidelidad/${token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo buscar tu tarjeta.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="container mi-tarjeta">
      <div className="mi-tarjeta-card">
        <span className="mi-tarjeta-eyebrow">Programa de fidelidad</span>
        <h1>Mi tarjeta</h1>
        <p>Entra con el WhatsApp con el que compraste y el código de 6 caracteres que aparece al reverso de tu tarjeta.</p>

        <form onSubmit={handleSubmit}>
          <label>
            <span>WhatsApp</span>
            <input
              type="tel"
              inputMode="tel"
              placeholder="656 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>
          <label>
            <span>Código de acceso</span>
            <input
              className="mi-tarjeta-code"
              placeholder="ABC123"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </label>

          {error && <p className="mi-tarjeta-error">{error}</p>}

          <button className="btn btn-primary btn-block" type="submit" disabled={searching}>
            {searching ? "Buscando…" : "Ver mi tarjeta"}
          </button>
        </form>

        <p className="mi-tarjeta-note">¿Aún no tienes tarjeta? Se crea automáticamente con tu primera compra.</p>
      </div>
    </div>
  );
}
