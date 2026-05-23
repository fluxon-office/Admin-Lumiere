function normalizePhone(value) {
  return (value || '').replace(/\D/g, '');
}

function formatPhone(value) {
  const digits = normalizePhone(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidPhone(value) {
  const digits = normalizePhone(value);
  return digits.length === 10 || digits.length === 11;
}

function createWhatsAppLink(phone, message = 'Olá, somos da Lumiere Clinic sobre o seu atendimento.') {
  return `https://wa.me/55${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

export { createWhatsAppLink, formatPhone, isValidPhone, normalizePhone };
