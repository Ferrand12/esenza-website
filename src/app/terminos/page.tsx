export const metadata = {
  title: "Términos y condiciones · Esenza",
  description:
    "Términos y condiciones de uso del sitio y de las reservas en Esenza.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <article className="max-w-3xl mx-auto prose prose-stone">
        <p className="font-script text-3xl text-secondary">Esenza</p>
        <h1 className="font-editorial text-4xl text-primary mt-2 mb-2">
          Términos y condiciones
        </h1>
        <p className="text-sm text-stone-500">
          Última actualización:{" "}
          {new Date().toLocaleDateString("es-CO", {
            month: "long",
            year: "numeric",
          })}
        </p>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          1. Aceptación
        </h2>
        <p>
          Al navegar este sitio y/o realizar una reserva, aceptás estos
          términos y la{" "}
          <a href="/privacidad" className="text-primary">
            política de privacidad
          </a>
          .
        </p>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          2. Reservas y pagos
        </h2>
        <ul>
          <li>
            La reserva queda confirmada luego de verificar disponibilidad y
            recibir el pago correspondiente.
          </li>
          <li>
            Los precios están expresados en pesos colombianos (COP) e incluyen
            los impuestos aplicables salvo que se indique lo contrario.
          </li>
          <li>
            El check-in es a partir de las 15:00 y el check-out hasta las
            12:00 del último día, salvo acuerdo distinto.
          </li>
        </ul>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          3. Política de cancelación
        </h2>
        <ul>
          <li>
            Cancelaciones con más de 15 días de anticipación: reembolso del
            100% menos comisiones bancarias aplicables.
          </li>
          <li>
            Cancelaciones entre 7 y 15 días antes: reembolso del 50%.
          </li>
          <li>
            Cancelaciones con menos de 7 días: no hay reembolso, pero podés
            reprogramar la estadía para una fecha futura (sujeto a
            disponibilidad).
          </li>
        </ul>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          4. Conducta y respeto
        </h2>
        <p>
          Esenza es un espacio de reconexión y descanso. Esperamos que los
          huéspedes respeten el silencio, el entorno natural, las áreas
          compartidas y al equipo. Conductas irrespetuosas pueden derivar en
          terminación de la estadía sin reembolso.
        </p>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          5. Responsabilidad
        </h2>
        <p>
          El huésped es responsable del uso adecuado de las instalaciones.
          Esenza no se responsabiliza por objetos de valor no declarados.
          Recomendamos no traer objetos innecesarios dado el perfil del
          retiro.
        </p>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          6. PQRSF
        </h2>
        <p>
          Podés radicar peticiones, quejas, reclamos, sugerencias o
          felicitaciones en{" "}
          <a href="/pqrsf" className="text-primary">
            /pqrsf
          </a>
          . Responderemos dentro de los plazos legales aplicables.
        </p>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          7. Propiedad intelectual
        </h2>
        <p>
          Todo el contenido del sitio (textos, imágenes, marca) es propiedad
          de Esenza o se usa con autorización. No está permitida la
          reproducción sin autorización previa por escrito.
        </p>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          8. Ley aplicable
        </h2>
        <p>
          Este contrato se rige por las leyes de la República de Colombia.
          Cualquier controversia se resolverá ante los jueces competentes de
          Cundinamarca, Colombia.
        </p>
      </article>
    </div>
  );
}
