import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDB({});
const dynamodb = DynamoDBDocument.from(client);

export const handler = async (event) => {
  console.log("Full event received:", JSON.stringify(event, null, 2));

  let userId;
  try {
    userId = event?.requestContext?.authorizer?.jwt?.claims?.sub;
    console.log("Extracted userId:", userId);

    if (!userId) {
      console.error("User ID not found in JWT claims");
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
  } catch (error) {
    console.error("Error extracting user ID:", error);
    return {
      statusCode: 401,
      headers: {
        "Access-Control-Allow-Origin": "https://localhost:5173",
        "Access-Control-Allow-Headers": "content-type,authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        error: "Unauthorized - Invalid request structure",
      }),
    };
  }

  try {
    // If deviceId provided, get specific device
    if (event.pathParameters?.deviceId) {
      const deviceParams = {
        TableName: "GarageDevices",
        Key: {
          deviceId: event.pathParameters.deviceId,
        },
      };

      console.log(
        "Fetching device with params:",
        JSON.stringify(deviceParams, null, 2)
      );
      const { Item: device } = await dynamodb.get(deviceParams);
      console.log("Retrieved device:", JSON.stringify(device, null, 2));

      // Check if user has access
      if (
        !device ||
        (device.ownerId !== userId && !device.userAccess?.includes(userId))
      ) {
        return {
          statusCode: 403,
          headers: {
            "Access-Control-Allow-Origin": "https://localhost:5173",
            "Access-Control-Allow-Headers": "content-type,authorization",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          },
          body: JSON.stringify({ error: "Not authorized" }),
        };
      }

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "https://localhost:5173",
          "Access-Control-Allow-Headers": "content-type,authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify(device),
      };
    }

    // First get devices where user is owner
    const ownerParams = {
      TableName: "GarageDevices",
      IndexName: "userAccess",
      KeyConditionExpression: "ownerId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    console.log(
      "Querying owned devices with params:",
      JSON.stringify(ownerParams, null, 2)
    );
    const ownedDevices = await dynamodb.query(ownerParams);
    console.log("Retrieved owned devices:", ownedDevices.Items?.length || 0);

    // Then get devices shared with user using scan (since we need to check array membership)
    const sharedParams = {
      TableName: "GarageDevices",
      FilterExpression: "contains(userAccess, :userId)",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    console.log(
      "Scanning for shared devices with params:",
      JSON.stringify(sharedParams, null, 2)
    );
    const sharedDevices = await dynamodb.scan(sharedParams);
    console.log("Retrieved shared devices:", sharedDevices.Items?.length || 0);

    // Combine results and remove duplicates
    const allDevices = [
      ...(ownedDevices.Items || []),
      ...(sharedDevices.Items || []),
    ].filter(
      (device, index, self) =>
        index === self.findIndex((d) => d.deviceId === device.deviceId)
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://localhost:5173",
        "Access-Control-Allow-Headers": "content-type,authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        devices: allDevices,
        debug: {
          userId,
          ownedCount: ownedDevices.Items?.length || 0,
          sharedCount: sharedDevices.Items?.length || 0,
          totalCount: allDevices.length,
        },
      }),
    };
  } catch (error) {
    console.error("Operation error:", error, error.stack);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://localhost:5173",
        "Access-Control-Allow-Headers": "content-type,authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        error: "Failed to fetch device(s)",
        debug: {
          errorMessage: error.message,
          errorType: error.name,
          errorStack: error.stack,
        },
      }),
    };
  }
};
