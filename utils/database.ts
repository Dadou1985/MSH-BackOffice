import mongoose from 'mongoose';
import { MongoClient, ServerApiVersion } from 'mongodb';
import admin from 'firebase-admin'
import Hotel from '../models/hotels/hotels.ts';
const mongoDbUri = process.env.MONGODB_URI;
const dbName = process.env.MONGO_DB_NAME;

console.log(dbName)

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
} as admin.ServiceAccount;

//Initialise Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();


if (!mongoDbUri) {
  throw new Error('MongoDB URI is not defined in the environment variables.');
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongoDbUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const BATCH_SIZE = 500;
const firestoreCollection = 'hotels';
const mongoDatabase = dbName;
const mongoCollection = 'hotels';

const mongoConnect = async () => {
  // try {
  //   // Connect the client to the server	(optional starting in v4.7)
  //   await client.connect();
  //   // Send a ping to confirm a successful connection
  //   await client.db(dbName).command({ ping: 1 });
  //   console.log("Pinged your deployment. You successfully connected to MongoDB!");
  // } finally {
  //   // Ensures that the client will close when you finish/error
  //   await client.close();
  // }

  try {
    await mongoose.connect(mongoDbUri, { dbName: process.env.MONGO_DB_NAME});
    console.log('Connecté à MongoDB avec Mongoose');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
  }
}

const migrate = async () => {
    try {
      await client.connect();
      const db = client.db(dbName); // nom de ta base MongoDB
      const collection = db.collection('guestUsers');
  
      const snapshot = await firestore.collection('guestUsers').get();
  
      const docs: any = [];
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

async function getSubCollectionsData(docRef: any) {
  const subcollections = await docRef.listCollections();
  const result: Record<string, any[]> = {};

  for (const subcol of subcollections) {
    const subSnapshot = await subcol.get();
    result[subcol.id] = [];

    subSnapshot.forEach((subdoc: any) => {
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
    const db = client.db(dbName); // nom de ta base MongoDB
    const collection = db.collection('usersInDepth');

    const snapshot = await firestore.collection('guestUsers').get();

    const docs: any = [];

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

      const docs: any = [];
      snapshot.forEach(doc => {
        docs.push({ _id: new mongoose.Types.ObjectId(), ...doc.data() });
      });

      await mongoCol.insertMany(docs);
      totalMigrated += docs.length;
      console.log(`Migrated ${docs.length} documents. Total so far: ${totalMigrated}`);

      lastDoc = snapshot.docs[snapshot.docs.length - 1];

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

const migrateHotelIds = async () => {
  await client.connect();

  const cursor = Hotel.find().cursor();

  let batch = [];

  for await (const hotel of cursor) {
    const oldId = hotel?._id?.toString?.();
    if (!oldId) {
      console.warn("⛔️ Document without valid _id, skipping:", hotel);
      continue;
    }

    if (oldId.length > 24) {
      const newId = oldId.slice(0, 24).padEnd(24, '0');

      batch.push({
        insertOne: {
          document: {
            ...hotel.toObject(),
            _id: new mongoose.Types.ObjectId(newId)
          }
        }
      });

      batch.push({
        deleteOne: { filter: { _id: hotel._id } }
      });

      if (batch.length >= BATCH_SIZE * 2) {
        await Hotel.bulkWrite(batch);
        batch = [];
      }
    }
  }

  if (batch.length > 0) {
    await Hotel.bulkWrite(batch);
  }

  console.log("✅ Migration terminée");
  process.exit();
};


const deleteHotelsInBatches = async () => {
  try {
    await client.connect();

    const BATCH_SIZE = 500;
    let hasMore = true;
    let totalDeleted = 0;

    while (hasMore) {
      const hotels = await Hotel.find().limit(BATCH_SIZE).select('_id');

      if (hotels.length === 0) {
        hasMore = false;
        break;
      }

      const ids = hotels.map(h => h._id);
      const result = await Hotel.deleteMany({ _id: { $in: ids } });
      totalDeleted += result.deletedCount;

      console.log(`🗑️ Supprimé ${result.deletedCount} documents`);
    }

    console.log(`✅ Suppression terminée. Total supprimé : ${totalDeleted}`);
  } catch (error) {
    console.error('Erreur lors de la suppression par lots :', error);
  } finally {
    await mongoose.disconnect();
  }
};

export { mongoConnect, migrate, deepMigration, largeMigration, migrateHotelIds, deleteHotelsInBatches };