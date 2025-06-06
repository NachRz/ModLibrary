import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import comentarioService from '../../services/api/comentarioService';
import { useNotification } from '../../context/NotificationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/components/mods/ComentariosMod.css';

const ComentariosMod = ({ modId, isAuthenticated, permitirComentarios = true, onStatsUpdate }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const comentariosRef = useRef(null);

  // Estados principales
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total_comentarios: 0,
    permite_comentarios: true
  });

  // Estados para crear comentario
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [errorComentario, setErrorComentario] = useState('');

  // Estados para editar comentarios
  const [comentarioEditando, setComentarioEditando] = useState(null);
  const [textoEditando, setTextoEditando] = useState('');

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalComentarios, setTotalComentarios] = useState(0);
  const [comentariosPorPagina] = useState(5);

  // Cargar comentarios
  const cargarComentarios = useCallback(async (pagina = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await comentarioService.getComentarios(modId, {
        page: pagina,
        perPage: comentariosPorPagina,
        sortBy: 'fecha',
        sortOrder: 'desc'
      });

      if (response.status === 'success') {
        setComentarios(response.data.data);
        setPaginaActual(response.data.current_page);
        setTotalPaginas(response.data.last_page);
        setTotalComentarios(response.data.total);

        // Actualizar estadísticas
        setEstadisticas(prev => ({
          ...prev,
          total_comentarios: response.data.total
        }));
      }
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
      setError(err.message || 'Error al cargar los comentarios');
      setComentarios([]);
    } finally {
      setLoading(false);
    }
  }, [modId, comentariosPorPagina]);

  // Cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    try {
      const response = await comentarioService.getEstadisticas(modId);
      if (response.status === 'success') {
        setEstadisticas(response.data);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  }, [modId]);

  // Efecto inicial
  useEffect(() => {
    if (modId) {
      cargarComentarios();
      cargarEstadisticas();
    }
  }, [modId, cargarComentarios, cargarEstadisticas]);

  // Efecto para notificar cambios en estadísticas al componente padre
  useEffect(() => {
    if (onStatsUpdate && estadisticas.total_comentarios !== undefined) {
      onStatsUpdate(estadisticas.total_comentarios);
    }
  }, [estadisticas.total_comentarios, onStatsUpdate]);

  // Manejar envío de nuevo comentario
  const handleEnviarComentario = async (e) => {
    e.preventDefault();

    if (!nuevoComentario.trim()) {
      setErrorComentario('El comentario no puede estar vacío');
      return;
    }

    if (nuevoComentario.trim().length < 3) {
      setErrorComentario('El comentario debe tener al menos 3 caracteres');
      return;
    }

    if (nuevoComentario.trim().length > 1000) {
      setErrorComentario('El comentario no puede exceder los 1000 caracteres');
      return;
    }

    try {
      setEnviandoComentario(true);
      setErrorComentario('');

      const response = await comentarioService.crearComentario(modId, nuevoComentario);

      if (response.status === 'success') {
        setNuevoComentario('');

        // Actualizar estadísticas
        const nuevoTotal = estadisticas.total_comentarios + 1;
        setEstadisticas(prev => ({
          ...prev,
          total_comentarios: nuevoTotal
        }));

        // Recargar la primera página para mostrar el nuevo comentario
        setPaginaActual(1);
        cargarComentarios(1);

        showNotification('Comentario publicado exitosamente', 'success');
      }
    } catch (err) {
      console.error('Error al crear comentario:', err);
      setErrorComentario(err.message || 'Error al publicar el comentario');
    } finally {
      setEnviandoComentario(false);
    }
  };

  // Iniciar edición de comentario
  const iniciarEdicion = (comentario) => {
    setComentarioEditando(comentario.id);
    setTextoEditando(comentario.contenido);
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setComentarioEditando(null);
    setTextoEditando('');
  };

  // Guardar edición
  const guardarEdicion = async (comentarioId) => {
    if (!textoEditando.trim()) {
      showNotification('El comentario no puede estar vacío', 'error');
      return;
    }

    try {
      const response = await comentarioService.actualizarComentario(modId, comentarioId, textoEditando);

      if (response.status === 'success') {
        setComentarioEditando(null);
        setTextoEditando('');

        // Recargar la página actual para mostrar el comentario actualizado
        cargarComentarios(paginaActual);

        showNotification('Comentario actualizado exitosamente', 'success');
      }
    } catch (err) {
      console.error('Error al actualizar comentario:', err);
      showNotification(err.message || 'Error al actualizar el comentario', 'error');
    }
  };

  // Eliminar comentario
  const eliminarComentario = async (comentarioId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      const response = await comentarioService.eliminarComentario(modId, comentarioId);

      if (response.status === 'success') {
        // Actualizar estadísticas
        const nuevoTotal = estadisticas.total_comentarios - 1;
        setEstadisticas(prev => ({
          ...prev,
          total_comentarios: nuevoTotal
        }));

        // Recargar la página actual, o ir a la anterior si esta se queda vacía
        const comentariosRestantes = comentarios.length - 1;
        if (comentariosRestantes === 0 && paginaActual > 1) {
          const nuevaPagina = paginaActual - 1;
          setPaginaActual(nuevaPagina);
          cargarComentarios(nuevaPagina);
        } else {
          cargarComentarios(paginaActual);
        }

        showNotification('Comentario eliminado exitosamente', 'success');
      }
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
      showNotification(err.message || 'Error al eliminar el comentario', 'error');
    }
  };

  // Cambiar página
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas && nuevaPagina !== paginaActual) {
      cargarComentarios(nuevaPagina);

      // Hacer scroll al principio de la lista de comentarios
      setTimeout(() => {
        if (comentariosRef.current) {
          comentariosRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100); // Pequeño delay para asegurar que el contenido se haya cargado
    }
  };

  // Manejar clic en usuario
  const handleUsuarioClick = (usuarioId) => {
    navigate(`/usuarios/${usuarioId}/perfil`);
  };

  // Generar números de página para mostrar
  const generarNumerosPagina = () => {
    const numeros = [];
    const maxVisible = 5;
    let inicio = Math.max(1, paginaActual - 2);
    let fin = Math.min(totalPaginas, inicio + maxVisible - 1);

    if (fin - inicio < maxVisible - 1) {
      inicio = Math.max(1, fin - maxVisible + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }

    return numeros;
  };

  // Renderizar paginación
  const renderPaginacion = () => {
    if (totalPaginas <= 1) return null;

    const numerosPagina = generarNumerosPagina();

    return (
      <div className="comentarios-pagination">
        <button
          className="pagination-btn prev"
          onClick={() => cambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          <i className="fas fa-chevron-left"></i>
          Anterior
        </button>

        <div className="pagination-numbers">
          {numerosPagina.map(numero => (
            <button
              key={numero}
              className={`pagination-btn ${numero === paginaActual ? 'active' : ''}`}
              onClick={() => cambiarPagina(numero)}
            >
              {numero}
            </button>
          ))}
        </div>

        <button
          className="pagination-btn next"
          onClick={() => cambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
        >
          Siguiente
          <i className="fas fa-chevron-right"></i>
        </button>

        <div className="pagination-info">
          Página {paginaActual} de {totalPaginas} ({totalComentarios} comentarios)
        </div>
      </div>
    );
  };

  // Renderizar formulario de comentario
  const renderFormularioComentario = () => {
    if (!isAuthenticated) {
      return (
        <div className="comentarios-login-needed">
          <div className="login-prompt">
            <i className="fas fa-sign-in-alt"></i>
            <p>Inicia sesión para escribir un comentario</p>
            <button
              className="login-btn"
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      );
    }

    if (!estadisticas.permite_comentarios) {
      return (
        <div className="comentarios-disabled">
          <i className="fas fa-comment-slash"></i>
          <p>Los comentarios están deshabilitados para este mod</p>
        </div>
      );
    }

    return (
      <form className="comentario-form" onSubmit={handleEnviarComentario}>
        <div className="form-header">
          <h3>Escribir un comentario</h3>
          <span className="character-count">
            {nuevoComentario.length}/1000
          </span>
        </div>

        <textarea
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          placeholder="Escribe tu comentario aquí..."
          className="comentario-textarea"
          rows="4"
          maxLength="1000"
          disabled={enviandoComentario}
        />

        {errorComentario && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {errorComentario}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="enviar-btn"
            disabled={enviandoComentario || !nuevoComentario.trim()}
          >
            {enviandoComentario ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Publicando...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Publicar comentario
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

  // Renderizar avatar de usuario
  const renderUserAvatar = (usuario) => {
    const getImageUrl = () => {
      if (usuario.foto_perfil) {
        if (usuario.foto_perfil.startsWith('http')) {
          return usuario.foto_perfil;
        }
        return `http://localhost:8000/storage/${usuario.foto_perfil}`;
      }
      return null;
    };

    const imageUrl = getImageUrl();

    return (
      <div
        className="comment-user-avatar"
        onClick={() => handleUsuarioClick(usuario.id)}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Avatar de ${usuario.nombre}`}
            className="avatar-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="avatar-fallback-comment"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          {usuario.nombre.charAt(0).toUpperCase()}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="comentarios-container">
        <div className="comentarios-loading">
          <div className="loading-spinner"></div>
          <p>Cargando comentarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comentarios-container">
      <div className="comentarios-header">
        <h2>
          <i className="fas fa-comments"></i>
          Comentarios ({estadisticas.total_comentarios})
        </h2>
      </div>

      {renderFormularioComentario()}

      {error && (
        <div className="comentarios-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={() => cargarComentarios()}>
            Reintentar
          </button>
        </div>
      )}

      <div className="comentarios-lista" ref={comentariosRef}>
        {comentarios.length > 0 ? (
          <div className="admin-table-container">
            <div className="admin-table-scroll">
              <table className="admin-table comentarios-table">
                <thead>
                  <tr>
                    <th className="col-user">Usuario</th>
                    <th className="col-content">Comentario</th>
                    <th className="col-date hidden lg:table-cell">Fecha</th>
                    <th className="actions-column">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {comentarios.map((comentario) => (
                    <tr key={comentario.id}>
                      <td className="col-user">
                        <div className="flex items-center">
                          {renderUserAvatar(comentario.usuario)}
                          <div className="min-w-0 flex-1 ml-3">
                            <div
                              className="text-purple-400 font-medium text-sm cursor-pointer hover:text-purple-300 transition-colors"
                              onClick={() => handleUsuarioClick(comentario.usuario.id)}
                            >
                              {comentario.usuario.nombre}
                            </div>
                            <div className="text-gray-400 text-xs lg:hidden">
                              {comentario.fecha_formateada}
                              {comentario.editado && (
                                <span className="editado-badge ml-2">editado</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="col-content">
                        {comentarioEditando === comentario.id ? (
                          <div className="edit-form-inline">
                            <textarea
                              value={textoEditando}
                              onChange={(e) => setTextoEditando(e.target.value)}
                              className="edit-textarea-inline"
                              rows="3"
                              maxLength="1000"
                            />
                            <div className="edit-actions-inline">
                              <button
                                onClick={() => guardarEdicion(comentario.id)}
                                className="action-btn-text save"
                                title="Guardar cambios"
                              >
                                <FontAwesomeIcon icon={faCheck} className="action-btn-icon" />
                              </button>
                              <button
                                onClick={cancelarEdicion}
                                className="action-btn-text cancel"
                                title="Cancelar edición"
                              >
                                <FontAwesomeIcon icon={faTimes} className="action-btn-icon" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="comment-content-text">
                            {comentario.contenido}
                          </div>
                        )}
                      </td>
                      <td className="col-date text-cell hidden lg:table-cell">
                        <div className="text-gray-400 text-sm">
                          {comentario.fecha_formateada}
                          {comentario.editado && (
                            <div className="editado-badge mt-1">editado</div>
                          )}
                        </div>
                      </td>
                      <td className="actions-column">
                        {comentario.es_autor && comentarioEditando !== comentario.id && (
                          <div className="action-buttons-container">
                            <button
                              onClick={() => iniciarEdicion(comentario)}
                              className="action-btn-text edit"
                              title="Editar comentario"
                            >
                              <FontAwesomeIcon icon={faEdit} className="action-btn-icon" />
                            </button>
                            <button
                              onClick={() => eliminarComentario(comentario.id)}
                              className="action-btn-text delete"
                              title="Eliminar comentario"
                            >
                              <FontAwesomeIcon icon={faTrash} className="action-btn-icon" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="sin-comentarios">
            <i className="fas fa-comment-slash"></i>
            <h3>No hay comentarios todavía</h3>
            <p>
              {isAuthenticated && estadisticas.permite_comentarios
                ? 'Sé el primero en comentar este mod'
                : 'Aún no hay comentarios para este mod'
              }
            </p>
          </div>
        )}

        {renderPaginacion()}
      </div>
    </div>
  );
};

export default ComentariosMod;