export async function seedPichincha(prisma) {
  const provincia = await prisma.provincia.upsert({
    where: { nombre: "Pichincha" },
    update: {},
    create: { nombre: "Pichincha" },
  });

  // Cantones de la provincia de Pichincha
  const cantones = [
    "Quito",
    "Cayambe",
    "Mejía",
    "Pedro Moncayo",
    "Rumiñahui",
    "San Miguel de los Bancos",
    "Pedro Vicente Maldonado",
    "Puerto Quito"
  ];
// Insertar cantones
  for (const canton of cantones) {
    await prisma.canton.upsert({
      where: { nombre: canton },
      update: {},
      create: {
        nombre: canton,
        provinciaId: provincia.id,
      },
    });
  }
}