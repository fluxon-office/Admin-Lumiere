import { initialAppointments, initialServices } from '../data/adminData';

const servicesStorageKey = 'lumiere-admin-services';
const appointmentsStorageKey = 'lumiere-admin-appointments';

function loadStoredServices() {
  try {
    const storedServices = window.localStorage.getItem(servicesStorageKey);
    return storedServices ? JSON.parse(storedServices) : initialServices;
  } catch {
    return initialServices;
  }
}

function loadStoredAppointments() {
  try {
    const storedAppointments = window.localStorage.getItem(appointmentsStorageKey);
    return storedAppointments ? JSON.parse(storedAppointments) : initialAppointments;
  } catch {
    return initialAppointments;
  }
}

function storeServices(services) {
  window.localStorage.setItem(servicesStorageKey, JSON.stringify(services));
}

function storeAppointments(appointments) {
  window.localStorage.setItem(appointmentsStorageKey, JSON.stringify(appointments));
}

export { loadStoredAppointments, loadStoredServices, storeAppointments, storeServices };
