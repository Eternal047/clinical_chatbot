export default async (parameters) => {
  const faq = `
📋 PREGUNTAS FRECUENTES Y AYUDA

🏥 SOBRE NOSOTROS
Somos un sistema de gestión de citas médicas disponible 24/7 a través de WhatsApp.

⏰ HORARIO DE ATENCIÓN
Lunes a Viernes: 8:00 AM - 6:00 PM
Sábados: 9:00 AM - 2:00 PM
Domingos: CERRADO

📍 UBICACIÓN
Av. Principal 123, Lima - Perú

📞 CONTACTO DIRECTO
Si necesitas atención inmediata, llama al: +51 XXX XXX XXX

🎯 COMANDOS DISPONIBLES
• "solicitar cita" - Agendar una nueva cita
• "cancelar cita" - Cancelar una cita existente
• "reprogramar cita" - Cambiar fecha/hora de una cita
• "consultar disponibilidad" - Ver horarios libres
• "consultar médicos" - Ver listado de doctores
• "consultar especialidades" - Ver especialidades disponibles
• "ayuda" - Ver esta información

❓ ¿CÓMO AGENDAR UNA CITA?
1. Escribe "solicitar cita"
2. Proporciona tu nombre, especialidad deseada, fecha y hora
3. Recibirás confirmación en el acto

💳 CANCELACIONES
Puedes cancelar una cita en cualquier momento escribiendo "cancelar cita" y tu DNI.

¿En qué más podemos ayudarte?
`;

  return faq.trim();
};
