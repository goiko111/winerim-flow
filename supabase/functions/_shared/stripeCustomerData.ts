const uppercaseFields = new Set([
  'companyName', 'restaurantName', 'customerName', 'vatId',
  'address', 'city', 'state', 'postalCode', 'country',
]);

/** Normaliza los datos identificativos sin alterar email, teléfono ni otros valores. */
export function uppercaseStripeCustomerData<T extends Record<string, unknown>>(
  data: T | null | undefined,
): T | null | undefined {
  if (!data) return data;
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [
    key,
    uppercaseFields.has(key) && typeof value === 'string' ? value.toUpperCase() : value,
  ])) as T;
}