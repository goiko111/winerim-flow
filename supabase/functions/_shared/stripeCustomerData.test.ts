import { expect, test } from 'bun:test';
import { uppercaseStripeCustomerData } from './stripeCustomerData';

test('envía los datos identificativos a Stripe en mayúsculas sin modificar el formulario', () => {
  const original = {
    companyName: 'El Tendedero Tabernas SL', restaurantName: 'Grupo Casa Curro',
    customerName: 'Iñigo Pérez', vatId: 'b12345678', address: 'Calle Gran Vía, 45',
    city: 'Bilbao', state: 'Bizkaia', postalCode: 'sw1a 1aa', country: 'es',
  };
  expect(uppercaseStripeCustomerData(original)).toEqual({
    companyName: 'EL TENDEDERO TABERNAS SL', restaurantName: 'GRUPO CASA CURRO',
    customerName: 'IÑIGO PÉREZ', vatId: 'B12345678', address: 'CALLE GRAN VÍA, 45',
    city: 'BILBAO', state: 'BIZKAIA', postalCode: 'SW1A 1AA', country: 'ES',
  });
  expect(original.companyName).toBe('El Tendedero Tabernas SL');
});

test('conserva email, teléfono, notas e identificadores', () => {
  const data = { email: 'Admin@restaurante.com', phone: '+34 600 123 456',
    onboardingNotes: 'Contactar por la tarde', winerimUserId: 123 };
  expect(uppercaseStripeCustomerData(data)).toEqual(data);
  expect(uppercaseStripeCustomerData(undefined)).toBeUndefined();
  expect(uppercaseStripeCustomerData(null)).toBeNull();
});