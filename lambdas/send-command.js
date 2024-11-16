import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane";

const client = new DynamoDB({});
const dynamodb = DynamoDBDocument.from(client);
const iot = new IoTDataPlaneClient({
  endpoint: process.env.IOT_ENDPOINT,
});

export const handler = async (event) => {
  console.log("Command event received:", JSON.stringify(event, null, 2));

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
    // Check access rights
    const deviceParams = {
      TableName: "GarageDevices",
      Key: {
        deviceId: deviceId,
      },
    };

    console.log(
      "Checking device access with params:",
      JSON.stringify(deviceParams, null, 2)
    );
    const { Item: device } = await dynamodb.get(deviceParams);

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
        body: JSON.stringify({ error: "Not authorized to access this device" }),
      };
    }

    // Parse and validate command
    const commandBody = JSON.parse(event.body);
    if (
      !commandBody?.action ||
      !["open", "close"].includes(commandBody.action)
    ) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "https://localhost:5173",
          "Access-Control-Allow-Headers": "content-type,authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          error: 'Invalid command action. Must be "open" or "close"',
        }),
      };
    }

    // Construct MQTT message
    const topic = `garage/${deviceId}/commands`;
    const message = {
      action: commandBody.action,
      timestamp: new Date().toISOString(),
      requestedBy: userId,
    };

    console.log("Publishing to topic:", topic, "message:", message);

    // Send command via MQTT
    await iot.send(
      new PublishCommand({
        topic,
        payload: Buffer.from(JSON.stringify(message)),
        qos: 0,
      })
    );

    // Log command in DynamoDB (optional)
    await dynamodb.update({
      TableName: "GarageDevices",
      Key: { deviceId },
      UpdateExpression: "SET lastCommand = :cmd, lastCommandTime = :time",
      ExpressionAttributeValues: {
        ":cmd": commandBody.action,
        ":time": new Date().toISOString(),
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://localhost:5173",
        "Access-Control-Allow-Headers": "content-type,authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        message: "Command sent successfully",
        command: commandBody.action,
        deviceId,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("Error sending command:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://localhost:5173",
        "Access-Control-Allow-Headers": "content-type,authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        error: "Failed to send command",
        debug: {
          errorMessage: error.message,
          errorType: error.name,
          errorStack: error.stack,
        },
      }),
    };
  }
};
