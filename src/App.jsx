import { BrowserRouter, Routes, Route, Link } from "react-router";
import Nino from "./pages/Nino";
import Padre from "./pages/Padre";
import "./App.css";

function Inicio() {
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