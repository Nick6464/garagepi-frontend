import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDB({});
const dynamodb = DynamoDBDocument.from(client);

export const handler = async (event) => {
  console.log("Claim device event:", JSON.stringify(event, null, 2));

  // Get user ID from Cognito
  const userId = event?.requestContext?.authorizer?.jwt?.claims?.sub;
  if (!userId) {
    return {
      statusCode: 401,
      headers: {
        "Access-Control-Allow-Origin": "https://localhost:5173",
        "Access-Control-Allow-Headers": "content-type,authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({ error: "Unauthorized - User ID not found" }),
    };
  }

  const deviceId = event.pathParameters?.deviceId;
  if (!deviceId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "https://localhost:5173",
        "Access-Control-Allow-Headers": "content-type,authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({ error: "Device ID is required" }),
    };
  }

  try {
    // First check if device exists
    const getParams = {
      TableName: "GarageDevices",
      Key: {
        deviceId: deviceId,
      },
    };

    const { Item: existingDevice } = await dynamodb.get(getParams);

    // If device doesn't exist at all, return error
    if (!existingDevice) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "https://localhost:5173",
          "Access-Control-Allow-Headers": "content-type,authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          error:
            "Device not found. Devices must be pre-registered before claiming.",
          deviceId: deviceId,
        }),
      };
    }

    // If device exists and has an owner, return error
    if (existingDevice.ownerId) {
      return {
        statusCode: 409,
        headers: {
          "Access-Control-Allow-Origin": "https://localhost:5173",
          "Access-Control-Allow-Headers": "content-type,authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          error: "Device already has an owner",
          deviceId: deviceId,
        }),
      };
    }

    // Claim the device - use conditional expression to ensure atomicity
    const updateParams = {
      TableName: "GarageDevices",
      Key: {
        deviceId: deviceId,
      },
      UpdateExpression:
        "SET ownerId = :userId, userAccess = :userAccess, #n = :name",
      ExpressionAttributeNames: {
        "#n": "name", // name is a reserved word
      },
      ExpressionAttributeValues: {
        ":userId": userId,
        ":userAccess": [userId],
        ":name": event.body ? JSON.parse(event.body).name : deviceId,
        ":noOwner": null,
      },
      // Add attribute_exists to ensure item must exist
      ConditionExpression:
        "attribute_exists(deviceId) AND (attribute_not_exists(ownerId) OR ownerId = :noOwner)",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamodb.update(updateParams);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://localhost:5173",
        "Access-Control-Allow-Headers": "content-type,authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        message: "Device claimed successfully",
        device: result.Attributes,
      }),
    };
  } catch (error) {
    console.error("Error claiming device:", error);

    // If condition check failed, device was claimed by someone else
    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 409,
        headers: {
          "Access-Control-Allow-Origin": "https://localhost:5173",
          "Access-Control-Allow-Headers": "content-type,authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          error: "Device was just claimed by someone else or does not exist",
          deviceId: deviceId,
        }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://localhost:5173",
        "Access-Control-Allow-Headers": "content-type,authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        error: "Failed to claim device",
        debug: {
          errorMessage: error.message,
          errorType: error.name,
          errorStack: error.stack,
        },
      }),
    };
  }
};
