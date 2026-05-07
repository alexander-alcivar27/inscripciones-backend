export async function seedManabi(prisma) {
  const provincia = await prisma.provincia.upsert({
    where: { nombre: "Manabí" },
    update: {},
    create: { nombre: "Manabí" },
  });
// Cantones de la provincia de Manabí
  const cantones = [
    "Portoviejo","Manta","Chone","Montecristi","Jipijapa",
    "Pedernales","El Carmen","Flavio Alfaro","Jama","Jaramijó",
    "Junín","Olmedo","Paján","Pichincha","Puerto López",
    "Rocafuerte","San Vicente","Santa Ana","Sucre","Tosagua",
    "24 de Mayo","Bolívar"
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