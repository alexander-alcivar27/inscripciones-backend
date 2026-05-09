import { seedManabi } from './manabi';
import { seedPichincha } from './pichincha';
import { seedGuayas } from './guayas';
import { seedGalapagos } from './galapagos';
import { seedSucumbios } from './sucumbios';
import { seedPastaza } from './pastaza';


// Función principal para ejecutar todas las semillas
export async function seedAll(prisma) {
  await seedManabi(prisma);
  await seedPichincha(prisma);
  await seedGuayas(prisma);
  await seedGalapagos(prisma);
  await seedSucumbios(prisma);
  await seedPastaza(prisma);
}