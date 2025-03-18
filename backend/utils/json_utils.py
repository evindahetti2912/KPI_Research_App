import json
from bson import ObjectId
from datetime import datetime


class MongoJSONEncoder(json.JSONEncoder):
    """JSON encoder that can handle MongoDB ObjectId and datetime objects."""

    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super(MongoJSONEncoder, self).default(obj)


def serialize_mongo(data):
    """
    Serialize MongoDB data to JSON-compatible format.

    Args:
        data: MongoDB data to serialize.

    Returns:
        JSON-compatible data.
    """
    return json.loads(json.dumps(data, cls=MongoJSONEncoder))