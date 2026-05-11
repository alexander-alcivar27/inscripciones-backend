// insertar datos de nacionalidades, provincia, canton, parroquia, etc. en la base de datos

// para insertar ejecutar en consola npx prisma db seed 
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

// 1. Configuración del Adaptador (Tal como lo tenías)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Iniciando carga de datos geográficos...");

  // El orden es importante por las relaciones (llaves foráneas)
  const sqlFiles = [
    'nacionalidad.sql',
    'provincia_canton.sql',
    'parroquias.sql'
  ];

  for (const file of sqlFiles) {
    try {
      console.log(`⏳ Procesando: ${file}...`);
      
      // Ajustamos la ruta: asumiendo que los .sql están en prisma/seeds/
      const filePath = path.join(__dirname, 'seeds', file);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`No se encontró el archivo en la ruta: ${filePath}`);
      }

      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Ejecución directa en la base de datos
      await prisma.$executeRawUnsafe(sql);
      
      console.log(`✅ ${file} cargado correctamente.`);
    } catch (error: any) {
      console.error(`❌ Error al procesar ${file}:`, error.message);
    }
  }

  console.log("⭐ ¡Proceso finalizado! Revisa Prisma Studio.");
}

main()
  .catch((e) => {
    console.error("❌ Error fatal en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Cerramos el pool de conexiones también
  });
