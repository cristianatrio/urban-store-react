/**
 * Script para cargar el catalogo inicial en Firestore.
 *
 * Uso:
 *   1. Copiar .env.example como .env y completar las credenciales de Firebase.
 *   2. Ejecutar: npm run seed
 *
 * Carga las colecciones:
 *   - items: catalogo completo de productos
 *   - categories: categorias para el menu (version dinamica)
 *
 * Si las colecciones ya tienen documentos, NO borra nada: solo informa.
 * Para recargar desde cero, pasar el flag --force:
 *   node --env-file=.env scripts/seed.js --force
 *
 * Para actualizar fotos, textos y destacados sin tocar el stock (ni los ids
 * que ya usan las ordenes), pasar el flag --update:
 *   node --env-file=.env scripts/seed.js --update
 */
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(join(__dirname, 'products.json'), 'utf-8')
);

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error(
    'Faltan las credenciales de Firebase. Copiá .env.example como .env y completalas.'
  );
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const force = process.argv.includes('--force');
const update = process.argv.includes('--update');

async function seedCollection(name, docs) {
  const ref = collection(db, name);
  const existing = await getDocs(ref);

  if (!existing.empty) {
    if (!force) {
      console.log(
        `La coleccion "${name}" ya tiene ${existing.size} documentos. Se omite (usá --force para recargar).`
      );
      return;
    }
    console.log(`Borrando ${existing.size} documentos de "${name}"…`);
    await Promise.all(existing.docs.map((d) => deleteDoc(doc(db, name, d.id))));
  }

  console.log(`Cargando ${docs.length} documentos en "${name}"…`);
  for (const docData of docs) {
    await addDoc(ref, docData);
  }
  console.log(`Coleccion "${name}" lista.`);
}

// Actualiza los documentos existentes buscando por matchField (key o title).
// El stock nunca se pisa: lo maneja la tienda con cada compra.
async function updateCollection(name, docs, matchField) {
  const existing = await getDocs(collection(db, name));
  const idByMatch = new Map(existing.docs.map((d) => [d.data()[matchField], d.id]));

  for (const { stock, ...fields } of docs) {
    const id = idByMatch.get(fields[matchField]);
    if (id) {
      await updateDoc(doc(db, name, id), fields);
    } else {
      console.log(`"${fields[matchField]}" no existe en "${name}". Se crea.`);
      await addDoc(collection(db, name), stock === undefined ? fields : { ...fields, stock });
    }
  }
  console.log(`Coleccion "${name}" actualizada (${docs.length} documentos).`);
}

try {
  if (update) {
    await updateCollection('categories', data.categories, 'key');
    await updateCollection('items', data.items, 'title');
    console.log('Actualizacion finalizada con exito.');
    process.exit(0);
  }
  await seedCollection('categories', data.categories);
  await seedCollection('items', data.items);
  console.log('Seed finalizado con exito.');
  process.exit(0);
} catch (err) {
  console.error('Error durante el seed:', err);
  process.exit(1);
}
