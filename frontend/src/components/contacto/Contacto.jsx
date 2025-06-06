import React, { useState } from 'react';
import '../../assets/styles/components/contacto/Contacto.css';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    // Simular envío del formulario
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });

      // Resetear mensaje de éxito después de 3 segundos
      setTimeout(() => setEnviado(false), 3000);
    }, 1500);
  };

  const contactInfo = [
    {
      title: "Teléfono",
      content: "+32 55 1234 5678",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      color: "bg-custom-primary"
    },
    {
      title: "Email",
      content: "contacto@modlibrary.com",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-custom-secondary"
    }
  ];

  const faqs = [
    {
      pregunta: "¿Cómo puedo subir mis propios mods?",
      respuesta: "Una vez registrado, ve a tu panel de usuario y selecciona 'Subir Mod'. Asegúrate de que el mod cumple con nuestras políticas de contenido."
    },
    {
      pregunta: "¿Los mods son gratuitos?",
      respuesta: "Sí, todos los mods en nuestra plataforma son completamente gratuitos para descargar y usar."
    },
    {
      pregunta: "¿Cómo reporto un problema con un mod?",
      respuesta: "Usa el botón 'Reportar' en la página del mod o contáctanos directamente a través de este formulario."
    },
    {
      pregunta: "¿Puedo solicitar mods específicos?",
      respuesta: "¡Por supuesto! Usa nuestro foro de solicitudes o contáctanos para hacer tu petición a la comunidad."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-custom-bg to-custom-bg/90">

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-custom-primary/10 via-custom-secondary/10 to-custom-tertiary/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative z-1">
          <div className="text-center">
            <h1 className="text-5xl tracking-tight font-extrabold text-custom-text sm:text-6xl">
              <span className="block mb-2">Ponte en</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-custom-secondary to-custom-tertiary">
                Contacto
              </span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-lg text-custom-detail/90 sm:max-w-3xl leading-relaxed">
              ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para ayudarte.
              Contáctanos y te responderemos lo antes posible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-custom-card/60 backdrop-blur-sm rounded-2xl p-6 border border-custom-detail/10 shadow-custom hover:shadow-custom-lg transition-all duration-500 hover:transform hover:-translate-y-2 group"
            >
              <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${info.color} text-custom-text mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {info.icon}
              </div>
              <h3 className="text-lg font-semibold text-custom-text mb-2 group-hover:text-custom-secondary transition-colors duration-300">
                {info.title}
              </h3>
              <p className="text-custom-detail/80 text-sm">
                {info.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: Form and Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact Form */}
          <div className="bg-custom-card/60 backdrop-blur-sm rounded-2xl p-8 border border-custom-detail/10 shadow-custom">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-custom-text mb-2">
                Envíanos un mensaje
              </h2>
              <p className="text-custom-detail/80">
                Completa el formulario y nos pondremos en contacto contigo pronto.
              </p>
            </div>

            {enviado && (
              <div className="mb-6 p-4 bg-custom-tertiary/20 border border-custom-tertiary/30 rounded-custom">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-custom-tertiary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-custom-tertiary font-medium">¡Mensaje enviado correctamente!</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-custom-text mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-custom-bg/50 border border-custom-detail/20 rounded-custom text-custom-text placeholder-custom-detail/60 focus:outline-none focus:ring-2 focus:ring-custom-secondary focus:border-transparent transition-all duration-300"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-custom-text mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-custom-bg/50 border border-custom-detail/20 rounded-custom text-custom-text placeholder-custom-detail/60 focus:outline-none focus:ring-2 focus:ring-custom-secondary focus:border-transparent transition-all duration-300"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="asunto" className="block text-sm font-medium text-custom-text mb-2">
                  Asunto
                </label>
                <input
                  type="text"
                  id="asunto"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-custom-bg/50 border border-custom-detail/20 rounded-custom text-custom-text placeholder-custom-detail/60 focus:outline-none focus:ring-2 focus:ring-custom-secondary focus:border-transparent transition-all duration-300"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-custom-text mb-2">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={6}
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-custom-bg/50 border border-custom-detail/20 rounded-custom text-custom-text placeholder-custom-detail/60 focus:outline-none focus:ring-2 focus:ring-custom-secondary focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-custom text-custom-text bg-custom-secondary hover:bg-custom-secondary/80 shadow-custom-lg hover:shadow-custom transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {enviando ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar mensaje
                    <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map and Additional Info */}
          <div className="space-y-8">
            {/* Map Placeholder */}
            <div className="bg-custom-card/60 backdrop-blur-sm rounded-2xl p-8 border border-custom-detail/10 shadow-custom">
              <h3 className="text-2xl font-bold text-custom-text mb-4">Información Adicional</h3>
              <div className="aspect-w-16 aspect-h-12 bg-custom-bg/50 rounded-custom overflow-hidden">
                <div className="flex items-center justify-center h-64 bg-gradient-to-br from-custom-primary/20 to-custom-secondary/20">
                  <div className="text-center">
                    <svg className="h-16 w-16 text-custom-secondary mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <p className="text-custom-text font-medium">Soporte 24/7</p>
                    <p className="text-custom-detail/80 text-sm mt-1">Estamos aquí para ayudarte</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-custom-card/60 backdrop-blur-sm rounded-2xl p-8 border border-custom-detail/10 shadow-custom">
              <h3 className="text-2xl font-bold text-custom-text mb-6">Preguntas Frecuentes</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-custom-detail/10 pb-4 last:border-b-0 last:pb-0">
                    <h4 className="text-custom-text font-medium mb-2">{faq.pregunta}</h4>
                    <p className="text-custom-detail/80 text-sm">{faq.respuesta}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Contacto; 