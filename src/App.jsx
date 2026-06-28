import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router";
import Nino from "./pages/Nino";
import Padre from "./pages/Padre";
import "./App.css";

function Inicio() {
  const [eventoInstalacion, setEventoInstalacion] = useState(null);
  const [mostrarBotonInstalar, setMostrarBotonInstalar] = useState(false);

  useEffect(() => {
    const manejarInstalacion = (evento) => {
      evento.preventDefault();
      setEventoInstalacion(evento);
      setMostrarBotonInstalar(true);
    };

    window.addEventListener("beforeinstallprompt", manejarInstalacion);

    return () => {
      window.removeEventListener("beforeinstallprompt", manejarInstalacion);
    };
  }, []);

  const instalarApp = async () => {
    if (!eventoInstalacion) {
      alert("Si no aparece la instalación, abre el menú de Chrome y toca 'Agregar a pantalla principal'.");
      return;
    }

    eventoInstalacion.prompt();

    await eventoInstalacion.userChoice;

    setEventoInstalacion(null);
    setMostrarBotonInstalar(false);
  };

  return (
    <div className="inicio">
      <div className="inicio-card">
        <h1>Sistema SIG de Monitoreo Infantil</h1>
        <p>
          Aplicación PWA para monitorear la ubicación de un niño mediante GPS,
          mostrar el rango seguro y alertar al padre o tutor si sale del área.
        </p>

        <div className="inicio-botones">
          <Link to="/nino" className="btn principal">
            Entrar como Niño
          </Link>

          <Link to="/padre" className="btn seguro">
            Entrar como Padre/Tutor
          </Link>

          {mostrarBotonInstalar && (
            <button className="btn instalar" onClick={instalarApp}>
              Instalar app
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/nino" element={<Nino />} />
        <Route path="/padre" element={<Padre />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;