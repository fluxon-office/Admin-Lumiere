function normalizePhone(value) {
  return value.replace(/\D/g, '');
}

function createWhatsAppLink(phone, message = 'Olá, somos da Lumiere Clinic sobre o seu atendimento.') {
  return `https://wa.me/55${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

export { createWhatsAppLink, normalizePhone };
