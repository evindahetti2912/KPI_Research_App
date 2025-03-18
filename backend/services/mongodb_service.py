from pymongo import MongoClient
from config import active_config
from utils.json_utils import serialize_mongo


class MongoDBService:
    """Service for MongoDB operations."""

    def __init__(self, database_name=None):
        """Initialize MongoDB connection."""
        self.client = MongoClient(active_config.MONGO_URI)
        self.db = self.client[database_name or active_config.MONGO_DB]

    def get_collection(self, collection_name):
        """Get a specific collection."""
        return self.db[collection_name]

    def insert_one(self, collection_name, document):
        """Insert a single document into the collection."""
        collection = self.get_collection(collection_name)
        result = collection.insert_one(document)
        return result.inserted_id

    def find_one(self, collection_name, query, serialize=False):
        """Find a single document in the collection."""
        collection = self.get_collection(collection_name)
        result = collection.find_one(query)
        return serialize_mongo(result) if serialize and result else result

    def find_many(self, collection_name, query=None, projection=None, limit=0, sort=None, serialize=False):
        """Find multiple documents in the collection."""
        collection = self.get_collection(collection_name)
        cursor = collection.find(query or {}, projection or {})

        if sort:
            cursor = cursor.sort(sort)

        if limit > 0:
            cursor = cursor.limit(limit)

        results = list(cursor)
        return serialize_mongo(results) if serialize else results

    def update_one(self, collection_name, query, update):
        """Update a single document in the collection."""
        collection = self.get_collection(collection_name)
        result = collection.update_one(query, update)
        return result.modified_count

    def delete_one(self, collection_name, query):
        """Delete a single document from the collection."""
        collection = self.get_collection(collection_name)
        result = collection.delete_one(query)
        return result.deleted_count

    def close(self):
        """Close the MongoDB connection."""
        self.client.close()


# Singleton instance of MongoDB service
mongodb_service = MongoDBService()