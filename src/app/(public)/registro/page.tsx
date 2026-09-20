import TarjetaCuenta from "@/components/cuenta/TarjetaCuenta";
import Campo from "@/components/ui/Campo";

export default function RegistroPage() {
  return (
    <TarjetaCuenta
      tipo="registro"
      titulo="Crea tu cuenta"
      subtitulo="Regístrate para inscribirte a las expediciones del club."
      textoNavegacion="¿Ya tienes una cuenta?"
      enlaceNavegacion="/iniciar-sesion"
      textoEnlace="Inicia sesión"
    >
      <Campo
        label="Correo electrónico"
        tipo="email"
        placeholder="correo@ejemplo.com"
      />
      <Campo
        label="Contraseña"
        tipo="password"
        placeholder="Ingresa tu contraseña"
      />
      <Campo
        label="Confirmar contraseña"
        tipo="password"
        placeholder="Repite tu contraseña"
      />
    </TarjetaCuenta>
  );
}