import mongoose from "mongoose";

function getMongoUri() {
  const value = process.env.MONGODB_URI;
  if (!value) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }
  return value;
}

type GlobalMongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: GlobalMongooseCache | undefined;
}

const cache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cache;
}

export async function connectToDatabase() {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
