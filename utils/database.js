
const { MongoClient, ServerApiVersion } = require('mongodb');
const admin = require('firebase-admin');
const serviceAccount = require('./firebasServiceAccountKey.json'); // Chemin vers ton fichier clé privée

const password = encodeURIComponent("Bec2gaz-2025-05!");

// Initialise Firestore
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
const firestore = admin.firestore();

const uri = `mongodb+srv://daddou:${password}@cluster0.at0smnc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const BATCH_SIZE = 500;
const firestoreCollection = 'hotels';
const mongoDatabase = 'mshDb';
const mongoCollection = 'hotels';

const mongoConnect = async () => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

const migrate = async () => {
    try {
      await client.connect();
      const db = client.db('mshDb'); // nom de ta base MongoDB
      const collection = db.collection('guestUsers');
  
      const snapshot = await firestore.collection('guestUsers').get();
  
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

async function getSubCollectionsData(docRef) {
  const subcollections = await docRef.listCollections();
  const result = {};

  for (const subcol of subcollections) {
    const subSnapshot = await subcol.get();
    result[subcol.id] = [];

    subSnapshot.forEach(subdoc => {
      result[subcol.id].push({
        _id: subdoc.id,
        ...subdoc.data()
      });
    });
  }

  return result;
}

const deepMigration = async () => {
  try {
    await client.connect();
    const db = client.db('mshDb'); // nom de ta base MongoDB
    const collection = db.collection('usersInDepth');

    const snapshot = await firestore.collection('guestUsers').get();

    const docs = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const subcollectionsData = await getSubCollectionsData(doc.ref);

      const fullDoc = {
        _id: doc.id, // garder le même ID
        ...data,
        ...subcollectionsData // sous-collections intégrées
      };

      docs.push(fullDoc);
    }

    if (docs.length > 0) {
      await collection.insertMany(docs);
      console.log('Migration terminée avec succès !');
    } else {
      console.log('Aucun document trouvé.');
    }
  } catch (error) {
    console.error('Erreur pendant la migration:', error);
  } finally {
    await client.close();
  }
}

const largeMigration = async () => {
  try {
    await client.connect();
    const db = client.db(mongoDatabase);
    const mongoCol = db.collection(mongoCollection);

    let lastDoc = null;
    let hasMore = true;
    let totalMigrated = 0;

    while (hasMore) {
      let query = firestore.collection(firestoreCollection).orderBy('hotelName', 'asc').limit(BATCH_SIZE);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();

      if (snapshot.empty) {
        hasMore = false;
        break;
      }

      const docs = [];
      snapshot.forEach(doc => {
        docs.push({ _id: doc.id, ...doc.data() });
      });

      await mongoCol.insertMany(docs);
      totalMigrated += docs.length;
      console.log(`Migrated ${docs.length} documents. Total so far: ${totalMigrated}`);

      lastDoc = snapshot.docs[snapshot.docs.length - 1];

      // Si moins de documents que batch, on a atteint la fin
      if (snapshot.size < BATCH_SIZE) {
        hasMore = false;
      }
    }

    console.log(`✅ Migration terminée. ${totalMigrated} documents migrés.`);
  } catch (err) {
    console.error('Erreur pendant la migration:', err);
  } finally {
    await client.close();
  }
}


module.exports.mongoConnect = mongoConnect;
module.exports.migrate = migrate;
module.exports.deepMigration = deepMigration;
module.exports.largeMigration = largeMigration;