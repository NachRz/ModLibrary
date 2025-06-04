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
    },
    {
      title: "Atención al Cliente",
      content: "Lunes a Viernes: 9:00 AM - 6:00 PM",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-custom-accent"
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Social Media and Additional Contact */}
      <div className="bg-custom-card/30 backdrop-blur-sm border-y border-custom-detail/10">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-custom-text mb-4">Síguenos en nuestras redes</h3>
            <p className="text-custom-detail/80 mb-8">Mantente al día con las últimas noticias y actualizaciones</p>
            <div className="flex justify-center space-x-6">
              {/* Social Media Icons */}
              <a href="#" className="text-custom-detail hover:text-custom-secondary transition-colors duration-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-custom-detail hover:text-custom-secondary transition-colors duration-300">
                <span className="sr-only">Discord</span>
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a href="#" className="text-custom-detail hover:text-custom-secondary transition-colors duration-300">
                <span className="sr-only">GitHub</span>
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Contacto; 