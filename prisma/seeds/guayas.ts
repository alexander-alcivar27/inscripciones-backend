export async function seedGuayas(prisma) {
  const provincia = await prisma.provincia.upsert({
    where: { nombre: "Guayas" },
    update: {},
    create: { nombre: "Guayas" },
  });

  // Cantones de la provincia de Guayas
  const cantones = [
    "Guayaquil","Durán","Samborondón","Daule",
    "Milagro","Playas","Naranjal","Yaguachi","Balzar"
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