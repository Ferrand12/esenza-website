export const metadata = {
  title: "Política de privacidad · Esenza",
  description:
    "Política de tratamiento de datos personales de Esenza conforme a la Ley 1581 de 2012 y sus decretos reglamentarios.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <article className="max-w-3xl mx-auto prose prose-stone">
        <p className="font-script text-3xl text-secondary">Esenza</p>
        <h1 className="font-editorial text-4xl text-primary mt-2 mb-2">
          Política de tratamiento de datos personales
        </h1>
        <p className="text-sm text-stone-500">
          Última actualización: {new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
        </p>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          1. Responsable del tratamiento
        </h2>
        <p>
          <strong>Esenza</strong> · Natural Wellness Stay, ubicado en
          Cundinamarca, Colombia, es el responsable del tratamiento de los
          datos personales recopilados a través de esta plataforma. Para
          comunicaciones escribinos a{" "}
          <a href="mailto:hola@esenza.co" className="text-primary">
            hola@esenza.co
          </a>
          .
        </p>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          2. Marco legal
        </h2>
        <p>
          Esta política está elaborada conforme a la{" "}
          <strong>Ley 1581 de 2012</strong>, el{" "}
          <strong>Decreto 1377 de 2013</strong> y demás normatividad colombiana
          sobre protección de datos personales (habeas data).
        </p>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          3. Datos que recolectamos
        </h2>
        <ul>
          <li>
            <strong>Datos de contacto</strong>: nombre completo, email,
            teléfono, país de residencia.
          </li>
          <li>
            <strong>Datos de reserva</strong>: fechas, número de huéspedes,
            paquete, pedidos especiales.
          </li>
          <li>
            <strong>Comunicaciones</strong>: mensajes que nos envíes por
            WhatsApp, email o el formulario de PQRSF.
          </li>
          <li>
            <strong>Datos de navegación</strong>: cookies técnicas necesarias
            para el funcionamiento del sitio.
          </li>
        </ul>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          4. Finalidades del tratamiento
        </h2>
        <ul>
          <li>Gestionar tu reserva y prestarte el servicio contratado.</li>
          <li>
            Atender peticiones, quejas, reclamos, sugerencias y felicitaciones
            (PQRSF).
          </li>
          <li>
            Enviar comunicaciones operativas (confirmación, recordatorios,
            follow-up post-estadía).
          </li>
          <li>
            Publicar reseñas con tu autorización previa y expresa.
          </li>
          <li>Cumplir obligaciones legales y tributarias aplicables.</li>
        </ul>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          5. Tus derechos
        </h2>
        <p>Como titular de los datos, tenés derecho a:</p>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos personales.</li>
          <li>Solicitar prueba de la autorización otorgada.</li>
          <li>
            Ser informado sobre el uso que se ha dado a tus datos, previa
            solicitud.
          </li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
          <li>
            Revocar la autorización y/o solicitar la supresión de tus datos
            cuando no se respeten los principios legales.
          </li>
        </ul>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          6. Cómo ejercer tus derechos
        </h2>
        <p>
          Podés ejercer estos derechos enviando un correo a{" "}
          <a href="mailto:hola@esenza.co" className="text-primary">
            hola@esenza.co
          </a>{" "}
          con el asunto "Habeas data" o radicando una PQRSF en{" "}
          <a href="/pqrsf" className="text-primary">
            /pqrsf
          </a>
          . Responderemos en un máximo de 15 días hábiles.
        </p>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          7. Seguridad y conservación
        </h2>
        <p>
          Conservamos tus datos por el tiempo estrictamente necesario para las
          finalidades descritas y conforme a las obligaciones legales.
          Aplicamos medidas técnicas y administrativas razonables para proteger
          la información contra accesos no autorizados, pérdida o alteración.
        </p>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          8. Encargados y transferencias
        </h2>
        <p>
          Para prestar nuestros servicios trabajamos con proveedores técnicos
          (hosting, email transaccional, pasarelas de pago). Estos solo acceden
          a los datos estrictamente necesarios y están obligados
          contractualmente a mantener la confidencialidad y seguridad.
        </p>

        <h2 className="font-editorial text-2xl text-primary mt-10">
          9. Cambios en esta política
        </h2>
        <p>
          Podemos actualizar esta política periódicamente. Publicaremos los
          cambios en esta página con la fecha de la última actualización.
        </p>
      </article>
    </div>
  );
}
