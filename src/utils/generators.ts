// Función para generar fechas aleatorias entre dos fechas
export const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Función para generar IDs aleatorios
export const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Función para generar emails aleatorios
export const generateRandomEmail = (): string => {
  const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'aol.com', 'empresa.com'];
  const firstNames = ['juan', 'maria', 'carlos', 'ana', 'pedro', 'sofia', 'miguel', 'laura', 'jose', 'patricia'];
  const lastNames = ['garcia', 'rodriguez', 'lopez', 'martinez', 'gonzalez', 'perez', 'sanchez', 'romero'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  
  // Añadir número aleatorio para hacerlo único
  const randomNum = Math.floor(Math.random() * 1000);
  
  return `${firstName}.${lastName}${randomNum}@${domain}`;
};