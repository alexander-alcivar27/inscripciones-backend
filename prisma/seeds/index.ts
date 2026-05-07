import { seedManabi } from './manabi';
import { seedPichincha } from './pichincha';
import { seedGuayas } from './guayas';


// Función principal para ejecutar todas las semillas
export async function seedAll(prisma) {
  await seedManabi(prisma);
  await seedPichincha(prisma);
  await seedGuayas(prisma);
}