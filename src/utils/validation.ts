/**
 * Validates an email address format
 */
export const validateEmail = (email: string): boolean => {
  const match = String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  return match !== null;
};

/**
 * Validates a PIN format
 */
export const validatePin = (pin: string): boolean => {
  // Check if PIN is exactly 6 digits
  return /^\d{6}$/.test(pin);
};