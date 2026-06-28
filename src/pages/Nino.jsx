import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

function Nino() {
  const [datosNino, setDatosNino] = useState({
    nombre: "",
    edad: "",
    lugar: "",
    tutor: "",
  });

  const [ubicacion, setUbicacion] = useState(null);
  const [error, setError] = useState("");
  const [watchId, setWatchId] = useState(null);
  const [estado, setEstado] = useState("DETENIDO");

  const intervaloRef = useRef(null);

  const cambiarDato = (e) => {
    const { name, value } = e.target;

    setDatosNino({
      ...datosNino,
      [name]: value,
    });
  };

  const validarDatos = () => {
    if (!datosNino.nombre.trim()) {
      setError("Ingrese el nombre del niño.");
      return false;
    }

    if (!datosNino.edad.trim()) {
      setError("Ingrese la edad del niño.");
      return false;
    }

    if (!datosNino.lugar.trim()) {
      setError("Ingrese el lugar de monitoreo.");
      return false;
    }

    if (!datosNino.tutor.trim()) {
      setError("Ingrese el nombre del padre, madre o tutor.");
      return false;
    }

    return true;
  };

  const enviarUbicacionFirebase = async (nuevaUbicacion) => {
    await setDoc(
      doc(db, "monitoreo", "nino-1"),
      {
        nombre: datosNino.nombre,
        edad: datosNino.edad,
        lugar: datosNino.lugar,
        tutor: datosNino.tutor,
        lat: nuevaUbicacion.lat,
        lng: nuevaUbicacion.lng,
        precision: nuevaUbicacion.precision,
        fecha: nuevaUbicacion.fecha,
        actualizadoEn: Date.now(),
      },
      { merge: true }
    );
  };

  const procesarUbicacion = async (posicion) => {
    const nuevaUbicacion = {
      lat: posicion.coords.latitude,
      lng: posicion.coords.longitude,
      precision: posicion.coords.accuracy,
      fecha: new Date().toLocaleTimeString(),
    };

    setUbicacion(nuevaUbicacion);
    setEstado("ENVIANDO");

    try {
      await enviarUbicacionFirebase(nuevaUbicacion);
    } catch {
      setError("No se pudo enviar la ubicación a Firebase.");
    }
  };

  const obtenerUbicacionManual = () => {
    navigator.geolocation.getCurrentPosition(
      procesarUbicacion,
      () => {
        setError("No se pudo actualizar la ubicación GPS.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  };

  const activarUbicacion = () => {
    setError("");

    if (!validarDatos()) {
      return;
    }

    if (!navigator.geolocation) {
      setError("Este navegador no soporta geolocalización.");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      procesarUbicacion,
      () => {
        setError("No se pudo obtener la ubicación. Revisa los permisos GPS.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    setWatchId(id);

    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
    }

    intervaloRef.current = setInterval(() => {
      obtenerUbicacionManual();
    }, 5000);
  };

  const detenerUbicacion = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }

    setEstado("DETENIDO");
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, [watchId]);

  return (
    <div className="pantalla">
      <header className="header">
        <h1>Modo Niño</h1>
        <p>Este celular envía la ubicación GPS real del niño en tiempo real.</p>
      </header>

      <main className="contenedor-simple">
        <section className="panel">
          <Link to="/" className="link-volver">
            ← Volver al inicio
          </Link>

          <h2>Datos del niño</h2>

          <div className="formulario">
            <label>
              Nombre del niño
              <input
                type="text"
                name="nombre"
                value={datosNino.nombre}
                onChange={cambiarDato}
                placeholder="Ej: Juan Pérez"
              />
            </label>

            <label>
              Edad
              <input
                type="number"
                name="edad"
                value={datosNino.edad}
                onChange={cambiarDato}
                placeholder="Ej: 5"
              />
            </label>

            <label>
              Lugar de monitoreo
              <input
                type="text"
                name="lugar"
                value={datosNino.lugar}
                onChange={cambiarDato}
                placeholder="Ej: Aula 204, UAGRM, Kinder o casa"
              />
            </label>

            <label>
              Padre, madre o tutor
              <input
                type="text"
                name="tutor"
                value={datosNino.tutor}
                onChange={cambiarDato}
                placeholder="Ej: María López"
              />
            </label>
          </div>

          <hr />

          <h2>Envío de ubicación</h2>

          <div className={`estado ${estado === "ENVIANDO" ? "normal" : "alerta"}`}>
            {estado === "ENVIANDO"
              ? "Ubicación activa: enviando posición real cada 5 segundos."
              : "Ubicación detenida."}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="botones">
            <button className="btn principal" onClick={activarUbicacion}>
              Activar ubicación del niño
            </button>

            <button className="btn detener" onClick={detenerUbicacion}>
              Detener ubicación
            </button>
          </div>

          <hr />

          <h2>Ubicación actual enviada</h2>

          {ubicacion ? (
            <div className="datos">
              <p>
                <strong>Latitud:</strong> {ubicacion.lat}
              </p>
              <p>
                <strong>Longitud:</strong> {ubicacion.lng}
              </p>
              <p>
                <strong>Precisión:</strong> {ubicacion.precision.toFixed(2)} metros
              </p>
              <p>
                <strong>Última actualización:</strong> {ubicacion.fecha}
              </p>
            </div>
          ) : (
            <p>No hay ubicación activa todavía.</p>
          )}

          <hr />

          <p className="texto-explicacion">
            Mantén esta pantalla abierta en el celular del niño. Mientras esté
            activa, enviará la ubicación GPS al padre o tutor en tiempo real.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Nino;