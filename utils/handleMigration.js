const admin = require('firebase-admin');
const { MongoClient } = require('mongodb');
const serviceAccount = require('./firebasServiceAccountKey.json'); // Chemin vers ton fichier clé privée

// Initialise Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const firestore = admin.firestore();

// Initialise MongoDB
const mongoUri = 'mongodb://localhost:27017'; // Change selon ta config
const client = new MongoClient(mongoUri);

async function migrate() {
  try {
    await client.connect();
    const db = client.db('nom_de_ta_base'); // nom de ta base MongoDB
    const collection = db.collection('nom_de_ta_collection');

    const snapshot = await firestore.collection('nom_collection_firestore').get();

    const docs = [];
    snapshot.forEach(doc => {
      docs.push({ _id: doc.id, ...doc.data() }); 
      // _id: doc.id pour garder les ID Firestore, sinon MongoDB créera ses propres _id
    });

    if (docs.length > 0) {
      await collection.insertMany(docs);
      console.log('Migration terminée avec succès !');
    } else {
      console.log('Aucun document à migrer.');
    }
  } catch (error) {
    console.error('Erreur pendant la migration:', error);
  } finally {
    await client.close();
  }
}

migrate();