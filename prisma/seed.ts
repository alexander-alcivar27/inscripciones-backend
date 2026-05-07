import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Importar funciones de semillas
import { seedAll } from './seeds';
//
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
// Crear instancia de Prisma con el adaptador de PostgreSQL
const adapter = new PrismaPg(pool);
// Crear instancia de Prisma Client
const prisma = new PrismaClient({
  adapter,
});
// Función principal para ejecutar las semillas
async function main() {
  console.log("🚀 Seeding Ecuador...");

  await seedAll(prisma);

  console.log("✅ Todo listo");
}
// Ejecutar la función principal
main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

