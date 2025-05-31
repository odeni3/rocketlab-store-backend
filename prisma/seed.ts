import { PrismaClient, Product } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando o seed do banco de dados...');

  // Limpa o banco antes de popular (opcional)
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Hash das senhas
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Criar usuários
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Rocketlab',
      email: 'admin@rocketlab.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      name: 'Usuário Teste',
      email: 'user@teste.com',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('✅ Usuários criados:');
  console.log(`   👑 Admin: ${adminUser.email} (senha: admin123)`);
  console.log(`   👤 User: ${normalUser.email} (senha: user123)`);

  // Criar produtos
  const produtos = [
    {
      name: 'Smartphone Samsung Galaxy S23',
      description:
        'Smartphone Android com 128GB de armazenamento, câmera tripla de 50MP e tela AMOLED de 6.1 polegadas.',
      price: 2899.99,
      stock: 15,
      category: 'Eletrônicos',
    },
    {
      name: 'Notebook Dell Inspiron 15',
      description:
        'Notebook com processador Intel Core i5, 8GB RAM, SSD 256GB e tela Full HD de 15.6 polegadas.',
      price: 3299.0,
      stock: 8,
      category: 'Informática',
    },
    {
      name: 'Fone de Ouvido Sony WH-1000XM4',
      description:
        'Fone de ouvido wireless com cancelamento de ruído ativo, bateria de 30 horas e alta qualidade de áudio.',
      price: 1499.9,
      stock: 25,
      category: 'Áudio',
    },
  ];

  const produtosCriados: Product[] = [];
  for (const produto of produtos) {
    const produtoCriado = await prisma.product.create({
      data: produto,
    });
    produtosCriados.push(produtoCriado);
  }

  console.log('✅ Produtos criados:');
  produtosCriados.forEach((produto) => {
    console.log(
      `   📱 ${produto.name} - R$ ${produto.price.toFixed(2)} (${produto.stock} em estoque)`,
    );
  });

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📝 Informações importantes:');
  console.log('   🔐 Login Admin: admin@rocketlab.com / admin123');
  console.log('   🔐 Login User: user@teste.com / user123');
  console.log(`   📦 ${produtosCriados.length} produtos disponíveis na loja`);
  console.log('\n🚀 Sua aplicação está pronta para uso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
