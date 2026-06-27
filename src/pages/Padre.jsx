import { useEffect, useState } from "react";
import { Link } from "react-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const iconoNino = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

function CambiarVistaMapa({ ubicacion }) {
  const map = useMap();

  useEffect(() => {
    if (ubicacion) {
      map.setView([ubicacion.lat, ubicacion.lng], 18);
    }
  }, [ubicacion, map]);

  return null;
}

function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
  const radioTierra = 6371000;

  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const diferenciaLat = ((lat2 - lat1) * Math.PI) / 180;
  const diferenciaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(diferenciaLat / 2) * Math.sin(diferenciaLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(diferenciaLon / 2) *
      Math.sin(diferenciaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radioTierra * c;
}

function Padre() {
  const radioAreaSegura = 20;

  const [ubicacionNino, setUbicacionNino] = useState(null);
  const [areaSegura, setAreaSegura] = useState(null);
  const [estado, setEstado] = useState("SIN_DATOS");
  const [distancia, setDistancia] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const referencia = doc(db, "monitoreo", "nino-1");

    const cancelarEscucha = onSnapshot(
      referencia,
      (documento) => {
        if (!documento.exists()) {
          setEstado("SIN_DATOS");
          return;
        }

        const data = documento.data();

        const nuevaUbicacion = {
          nombre: data.nombre,
          edad: data.edad,
          lugar: data.lugar,
          tutor: data.tutor,
          lat: data.lat,
          lng: data.lng,
          precision: data.precision,
          fecha: data.fecha,
          actualizadoEn: data.actualizadoEn,
        };

        setUbicacionNino(nuevaUbicacion);

        if (areaSegura) {
          const distanciaCalculada = calcularDistanciaMetros(
            areaSegura.lat,
            areaSegura.lng,
            nuevaUbicacion.lat,
            nuevaUbicacion.lng
          );

          setDistancia(distanciaCalculada);

          if (distanciaCalculada <= radioAreaSegura) {
            setEstado("DENTRO");
          } else {
            setEstado("FUERA");
          }
        } else {
          setEstado("UBICACION_RECIBIDA");
        }
      },
      () => {
        setError("No se pudo leer la ubicación del niño desde Firebase.");
      }
    );

    return () => cancelarEscucha();
  }, [areaSegura]);

  const marcarRangoSeguro = () => {
    if (!ubicacionNino) {
      setError("Primero debe recibirse la ubicación actual del niño.");
      return;
    }

    setAreaSegura({
      lat: ubicacionNino.lat,
      lng: ubicacionNino.lng,
    });

    setDistancia(0);
    setEstado("DENTRO");
    setError("");
  };

  const obtenerTextoEstado = () => {
    if (estado === "SIN_DATOS") {
      return "Esperando ubicación actual del niño.";
    }

    if (estado === "UBICACION_RECIBIDA") {
      return "Ubicación del niño recibida. Falta marcar el rango seguro.";
    }

    if (estado === "DENTRO") {
      return "Estado normal: su hijo está dentro del rango seguro.";
    }

    if (estado === "FUERA") {
      return "ALERTA: su hijo salió del rango seguro del lugar marcado.";
    }

    return "";
  };

  const segundosDesdeActualizacion = ubicacionNino?.actualizadoEn
    ? Math.floor((Date.now() - ubicacionNino.actualizadoEn) / 1000)
    : null;

  return (
    <div className="pantalla">
      <header className="header">
        <h1>Modo Padre/Tutor</h1>
        <p>Visualización del niño, rango seguro y alerta en tiempo real.</p>
      </header>

      <main className="contenedor">
        <section className="panel">
          <Link to="/" className="link-volver">
            ← Volver al inicio
          </Link>

          <h2>Datos del niño</h2>

          {ubicacionNino ? (
            <div className="datos">
              <p>
                <strong>Nombre:</strong> {ubicacionNino.nombre}
              </p>
              <p>
                <strong>Edad:</strong> {ubicacionNino.edad} años
              </p>
              <p>
                <strong>Lugar:</strong> {ubicacionNino.lugar}
              </p>
              <p>
                <strong>Tutor:</strong> {ubicacionNino.tutor}
              </p>
            </div>
          ) : (
            <p>Aún no se recibieron datos del niño.</p>
          )}

          <hr />

          <h2>Estado de seguridad</h2>

          <div className={`estado ${estado === "FUERA" ? "alerta" : "normal"}`}>
            {obtenerTextoEstado()}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="botones">
            <button className="btn seguro" onClick={marcarRangoSeguro}>
              Marcar rango seguro aquí
            </button>
          </div>

          <hr />

          <h2>Ubicación actual del niño</h2>

          {ubicacionNino ? (
            <div className="datos">
              <p>
                <strong>Latitud:</strong> {ubicacionNino.lat}
              </p>
              <p>
                <strong>Longitud:</strong> {ubicacionNino.lng}
              </p>
              <p>
                <strong>Precisión GPS:</strong>{" "}
                {ubicacionNino.precision?.toFixed(2)} metros
              </p>
              <p>
                <strong>Última actualización:</strong> {ubicacionNino.fecha}
              </p>
              {segundosDesdeActualizacion !== null && (
                <p>
                  <strong>Recibido hace:</strong> {segundosDesdeActualizacion} segundos
                </p>
              )}
            </div>
          ) : (
            <p>Aún no se recibió ubicación del niño.</p>
          )}

          <hr />

          <h2>Rango seguro</h2>

          {areaSegura ? (
            <div className="datos">
              <p>
                <strong>Radio:</strong> {radioAreaSegura} metros
              </p>
              <p>
                <strong>Centro:</strong> {areaSegura.lat}, {areaSegura.lng}
              </p>
              {distancia !== null && (
                <p>
                  <strong>Distancia del niño:</strong> {distancia.toFixed(2)} metros
                </p>
              )}
            </div>
          ) : (
            <p>Aún no se marcó el rango seguro.</p>
          )}
        </section>

        <section className="mapa-card">
          <MapContainer
            center={
              ubicacionNino
                ? [ubicacionNino.lat, ubicacionNino.lng]
                : [-17.7833, -63.1821]
            }
            zoom={17}
            className="mapa"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {ubicacionNino && (
              <>
                <CambiarVistaMapa ubicacion={ubicacionNino} />

                <Marker
                  position={[ubicacionNino.lat, ubicacionNino.lng]}
                  icon={iconoNino}
                >
                  <Popup>
                    Ubicación actual de {ubicacionNino.nombre}
                    <br />
                    Precisión: {ubicacionNino.precision?.toFixed(2)} m
                  </Popup>
                </Marker>
              </>
            )}

            {areaSegura && (
              <Circle
                center={[areaSegura.lat, areaSegura.lng]}
                radius={radioAreaSegura}
                pathOptions={{
                  color: estado === "FUERA" ? "red" : "green",
                  fillColor: estado === "FUERA" ? "red" : "green",
                  fillOpacity: 0.25,
                }}
              >
                <Popup>Rango seguro marcado: {radioAreaSegura} metros</Popup>
              </Circle>
            )}
          </MapContainer>
        </section>
      </main>
    </div>
  );
}

export default Padre;