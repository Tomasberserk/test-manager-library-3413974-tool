/**
 * Manager Library - Herramienta de Demostración y Siembra Masiva (T-21)
 * Consume estrictamente la API REST por HTTP sin tocar SQL directo.
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin1234';

async function request(endpoint, options = {}, token = null) {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`[${res.status}] ${data.code || 'ERROR'}: ${data.message || 'Error en petición'}`);
  }

  return data;
}

async function main() {
  console.log('====================================================');
  console.log('🚀 MANAGER LIBRARY - HERRAMIENTA DEMO SEEDER (T-21)');
  console.log(`📡 Conectando a la API: ${API_BASE}`);
  console.log('====================================================\n');

  // 1. Health check
  try {
    const health = await request('/health');
    console.log(`✓ Health check verificado: status = ${health.status}`);
  } catch (err) {
    console.error(`❌ Falló la conexión con la API en ${API_BASE}. Asegúrate de que el servidor esté levantado.`);
    console.error(err.message);
    process.exit(1);
  }

  // 2. Login as admin
  console.log(`\n🔑 Autenticando como '${ADMIN_USER}'...`);
  const auth = await request('/auth/login', {
    method: 'POST',
    body: { username: ADMIN_USER, password: ADMIN_PASS }
  });
  const token = auth.access_token;
  console.log(`✓ Token JWT obtenido exitosamente (Rol: ${auth.role}, Expira en ${auth.expires_in}s)`);

  // 3. Get categories
  const categories = await request('/categories', {}, token);
  console.log(`✓ ${categories.length} categorías obtenidas del servidor: ${categories.map(c => c.name).join(', ')}`);

  const catMap = {};
  categories.forEach(c => { catMap[c.name] = c.id; });

  // 4. Seed >= 40 Books
  console.log('\n📚 Sembrando catálogo de 40 libros...');
  const booksCatalog = [
    // Novela (8)
    { title: 'Cien años de soledad', author: 'Gabriel García Márquez', cat: 'Novela', total: 5 },
    { title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', cat: 'Novela', total: 4 },
    { title: 'El amor en los tiempos del cólera', author: 'Gabriel García Márquez', cat: 'Novela', total: 4 },
    { title: 'La ciudad y los perros', author: 'Mario Vargas Llosa', cat: 'Novela', total: 3 },
    { title: 'Rayuela', author: 'Julio Cortázar', cat: 'Novela', total: 3 },
    { title: 'Ficciones', author: 'Jorge Luis Borges', cat: 'Novela', total: 4 },
    { title: 'Pedro Páramo', author: 'Juan Rulfo', cat: 'Novela', total: 3 },
    { title: 'Ensayo sobre la ceguera', author: 'José Saramago', cat: 'Novela', total: 4 },

    // Ciencia (8)
    { title: 'Cosmos', author: 'Carl Sagan', cat: 'Ciencia', total: 4 },
    { title: 'Breve historia del tiempo', author: 'Stephen Hawking', cat: 'Ciencia', total: 5 },
    { title: 'El origen de las especies', author: 'Charles Darwin', cat: 'Ciencia', total: 3 },
    { title: 'El gen egoísta', author: 'Richard Dawkins', cat: 'Ciencia', total: 3 },
    { title: 'El universo elegante', author: 'Brian Greene', cat: 'Ciencia', total: 3 },
    { title: 'Astros, átomos y hombres', author: 'Carl Sagan', cat: 'Ciencia', total: 3 },
    { title: 'La física de lo imposible', author: 'Michio Kaku', cat: 'Ciencia', total: 4 },
    { title: 'Una breve historia de casi todo', author: 'Bill Bryson', cat: 'Ciencia', total: 4 },

    // Tecnología (8)
    { title: 'Código Limpio (Clean Code)', author: 'Robert C. Martin', cat: 'Tecnología', total: 6 },
    { title: 'El programador pragmático', author: 'Andrew Hunt & David Thomas', cat: 'Tecnología', total: 5 },
    { title: 'Patrones de Diseño (GoF)', author: 'Erich Gamma et al.', cat: 'Tecnología', total: 4 },
    { title: 'Arquitectura Limpia', author: 'Robert C. Martin', cat: 'Tecnología', total: 5 },
    { title: 'Refactorización', author: 'Martin Fowler', cat: 'Tecnología', total: 3 },
    { title: 'Diseño Guiado por el Dominio', author: 'Eric Evans', cat: 'Tecnología', total: 4 },
    { title: 'Introducción a los Algoritmos', author: 'Thomas Cormen et al.', cat: 'Tecnología', total: 3 },
    { title: 'Redes de Computadoras', author: 'Andrew S. Tanenbaum', cat: 'Tecnología', total: 4 },

    // Historia (8)
    { title: 'Sapiens: De animales a dioses', author: 'Yuval Noah Harari', cat: 'Historia', total: 5 },
    { title: 'Homo Deus', author: 'Yuval Noah Harari', cat: 'Historia', total: 4 },
    { title: 'Armas, gérmenes y acero', author: 'Jared Diamond', cat: 'Historia', total: 4 },
    { title: 'La Segunda Guerra Mundial', author: 'Antony Beevor', cat: 'Historia', total: 3 },
    { title: 'El Imperio Romano', author: 'Isaac Asimov', cat: 'Historia', total: 3 },
    { title: 'Historia de dos ciudades', author: 'Charles Dickens', cat: 'Historia', total: 3 },
    { title: 'Breve historia de Colombia', author: 'Jorge Orlando Melo', cat: 'Historia', total: 4 },
    { title: 'Las venas abiertas de América Latina', author: 'Eduardo Galeano', cat: 'Historia', total: 5 },

    // Infantil (8)
    { title: 'El Principito', author: 'Antoine de Saint-Exupéry', cat: 'Infantil', total: 6 },
    { title: 'Donde viven los monstruos', author: 'Maurice Sendak', cat: 'Infantil', total: 4 },
    { title: 'Matilda', author: 'Roald Dahl', cat: 'Infantil', total: 4 },
    { title: 'Charlie y la fábrica de chocolate', author: 'Roald Dahl', cat: 'Infantil', total: 4 },
    { title: 'Alicia en el país de las maravillas', author: 'Lewis Carroll', cat: 'Infantil', total: 4 },
    { title: 'Las crónicas de Narnia: El león', author: 'C.S. Lewis', cat: 'Infantil', total: 5 },
    { title: 'Peter Pan', author: 'J.M. Barrie', cat: 'Infantil', total: 3 },
    { title: 'Cuentos de la selva', author: 'Horacio Quiroga', cat: 'Infantil', total: 4 },
  ];

  const createdBooks = [];
  let isbnBase = 9781000000000n;

  for (const b of booksCatalog) {
    isbnBase += 1n;
    const isbnStr = isbnBase.toString().padStart(13, '0');
    try {
      const book = await request('/books', {
        method: 'POST',
        body: {
          title: b.title,
          author: b.author,
          isbn: isbnStr,
          category_id: catMap[b.cat],
          total_copies: b.total
        }
      }, token);
      createdBooks.push(book);
    } catch (err) {
      // If already exists, fetch from catalog
      const list = await request(`/books?q=${encodeURIComponent(b.title)}`, {}, token);
      if (list.items && list.items.length > 0) {
        createdBooks.push(list.items[0]);
      }
    }
  }
  console.log(`✓ Catálogo listo con ${createdBooks.length} libros disponibles.`);

  // 5. Seed >= 10 Members
  console.log('\n👥 Sembrando 10 socios...');
  const membersData = [
    { name: 'Andrés Felipe Morales', doc: '1098765001' },
    { name: 'Camila Andrea Ospina', doc: '1098765002' },
    { name: 'Diego Fernando Rivas', doc: '1098765003' },
    { name: 'Laura Valentina Castillo', doc: '1098765004' },
    { name: 'Mateo Alejandro Gómez', doc: '1098765005' },
    { name: 'Sofía Isabel Restrepo', doc: '1098765006' },
    { name: 'Juan Sebastián Vargas', doc: '1098765007' },
    { name: 'Mariana Lucia Beltrán', doc: '1098765008' },
    { name: 'Daniel Esteban Silva', doc: '1098765009' },
    { name: 'Valentina Sofía Navarro', doc: '1098765010' },
  ];

  const createdMembers = [];
  for (const m of membersData) {
    try {
      const mem = await request('/members', {
        method: 'POST',
        body: { full_name: m.name, document_number: m.doc }
      }, token);
      createdMembers.push(mem);
    } catch (err) {
      const list = await request(`/members?q=${m.doc}`, {}, token);
      if (list.items && list.items.length > 0) {
        createdMembers.push(list.items[0]);
      }
    }
  }
  console.log(`✓ ${createdMembers.length} socios registrados en la base de datos.`);

  // 6. Seed >= 15 Loans (including 3 overdue)
  console.log('\n📖 Generando 15 préstamos de demostración (incluyendo 3 vencidos)...');
  const now = new Date();
  const pastDate25DaysAgo = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString();
  const pastDate20DaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString();
  const pastDate18DaysAgo = new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString();
  const recentDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

  let loansCount = 0;

  // Préstamos Vencidos (Socios 0, 1, 2)
  const overdueConfigs = [
    { memberIdx: 0, bookIdx: 0, date: pastDate25DaysAgo },
    { memberIdx: 1, bookIdx: 8, date: pastDate20DaysAgo },
    { memberIdx: 2, bookIdx: 16, date: pastDate18DaysAgo },
  ];

  for (const ov of overdueConfigs) {
    try {
      await request('/loans', {
        method: 'POST',
        body: {
          member_id: createdMembers[ov.memberIdx].id,
          loaned_at: ov.date,
          items: [{ book_id: createdBooks[ov.bookIdx].id }]
        }
      }, token);
      loansCount++;
    } catch (e) {
      console.warn('Préstamo vencido omitido o ya existente:', e.message);
    }
  }

  // Préstamos Activos y Normales para los demás socios (Socios 3 al 9)
  let bCursor = 24;
  for (let i = 3; i < createdMembers.length; i++) {
    const mem = createdMembers[i];
    const b1 = createdBooks[(bCursor++) % createdBooks.length];
    const b2 = createdBooks[(bCursor++) % createdBooks.length];

    try {
      const loan = await request('/loans', {
        method: 'POST',
        body: {
          member_id: mem.id,
          loaned_at: recentDate,
          items: [
            { book_id: b1.id },
            { book_id: b2.id }
          ]
        }
      }, token);
      loansCount++;

      // Devolver 1 línea en algunos préstamos para demostrar devoluciones parciales
      if (i % 2 === 0 && loan.items && loan.items.length > 0) {
        await request(`/loans/${loan.id}/items/${loan.items[0].id}/return`, {
          method: 'POST'
        }, token);
      }
    } catch (e) {
      console.warn('Préstamo omitido:', e.message);
    }
  }

  // Préstamos adicionales para alcanzar >= 15
  while (loansCount < 15) {
    const mem = createdMembers[3]; // socio 3
    const book = createdBooks[(bCursor++) % createdBooks.length];
    try {
      await request('/loans', {
        method: 'POST',
        body: {
          member_id: mem.id,
          loaned_at: recentDate,
          items: [{ book_id: book.id }]
        }
      }, token);
      loansCount++;
    } catch (e) {
      break;
    }
  }

  console.log(`✓ Total de préstamos procesados: ${loansCount}`);

  // 7. Verify Overdue loans endpoint
  const overdueRes = await request('/loans/overdue', {}, token);
  console.log(`\n⏰ Comprobando /loans/overdue: ${overdueRes.items?.length || 0} libros vencidos encontrados.`);

  // 8. Verify Report endpoint
  const fromDate = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const toDate = now.toISOString().split('T')[0];
  const report = await request(`/reports/most-borrowed?from=${fromDate}&to=${toDate}`, {}, token);
  console.log(`📊 Comprobando /reports/most-borrowed: ${report.rows?.length || 0} títulos en el reporte.`);

  console.log('\n====================================================');
  console.log('✅ DEMOSTRACIÓN SEMBRADA CON ÉXITO (T-21 CUMPLIDO)');
  console.log('====================================================\n');
}

main().catch(err => {
  console.error('\n❌ ERROR FATAL:', err.message);
  process.exit(1);
});
