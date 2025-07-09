const { PrismaClient } = require('@prisma/client');
     const prisma = new PrismaClient();

     async function main() {
       await prisma.user.create({
         data: {
           name: "Test",
           email: "test@example.com",
           password: "test",
           role: "ADMIN"
         }
       });
       console.log("User created!");
     }

     main().catch(e => console.error(e)).finally(() => prisma.$disconnect());