import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";

const client = new DynamoDB({});
const dynamodb = DynamoDBDocument.from(client);
const cognito = new CognitoIdentityProvider({});

export const handler = async (event) => {
  console.log("Event received:", JSON.stringify(event));

  const userId = event?.requestContext?.authorizer?.jwt?.claims?.sub;
  console.log("Authenticated userId:", userId);

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

  const body = JSON.parse(event.body || "{}");
  const targetEmail = body.email?.toLowerCase();

  if (!targetEmail || !targetEmail.includes("@")) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "https://localhost:5173",
        "Access-Control-Allow-Headers": "content-type,authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({ error: "Valid email address is required" }),
    };
  }

  const method = event.requestContext.http.method;
  console.log("Request details:", {
    method,
    deviceId,
    targetEmail,
  });

  try {
    // First verify the device exists and requesting user is the owner
    const getParams = {
      TableName: "GarageDevices",
      Key: {
        deviceId: deviceId,
      },
    };

    const { Item: device } = await dynamodb.get(getParams);
    console.log("Device lookup result:", {
      found: !!device,
      deviceId,
      ownerId: device?.ownerId,
      currentAccess: device?.userAccess,
    });

    if (!device) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "https://localhost:5173",
          "Access-Control-Allow-Headers": "content-type,authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({ error: "Device not found" }),
      };
    }

    if (device.ownerId !== userId) {
      return {
        statusCode: 403,
        headers: {
          "Access-Control-Allow-Origin": "https://localhost:5173",
          "Access-Control-Allow-Headers": "content-type,authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          error: "Only the device owner can share access",
        }),
      };
    }

    // Find Cognito user by email
    let targetUserId;
    try {
      const listUsersResponse = await cognito.listUsers({
        UserPoolId: process.env.USER_POOL_ID,
        Filter: `email = "${targetEmail}"`,
        Limit: 1,
      });

      console.log("Cognito lookup result:", {
        found: !!listUsersResponse.Users?.length,
        targetEmail,
        targetUserId: listUsersResponse.Users?.[0]?.Username,
        targetUserSub: listUsersResponse.Users?.[0]?.Attributes?.find(
          (attr) => attr.Name === "sub"
        )?.Value,
      });

      if (!listUsersResponse.Users || listUsersResponse.Users.length === 0) {
        return {
          statusCode: 404,
          headers: {
            "Access-Control-Allow-Origin": "https://localhost:5173",
            "Access-Control-Allow-Headers": "content-type,authorization",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          },
          body: JSON.stringify({
            error: "No user found with this email address",
            message:
              "The user must create an account before they can be granted access.",
          }),
        };
      }

      // Get the sub (userId) from the user's attributes
      targetUserId = listUsersResponse.Users[0].Attributes.find(
        (attr) => attr.Name === "sub"
      )?.Value;

      // Check if target user is owner
      if (device.ownerId === targetUserId) {
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "https://localhost:5173",
            "Access-Control-Allow-Headers": "content-type,authorization",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          },
          body: JSON.stringify({
            error: "You already own this device",
          }),
        };
      }

      // Check existing access
      const currentAccess = device.userAccess || [];
      if (currentAccess.includes(targetUserId)) {
        if (method === "POST") {
          return {
            statusCode: 409,
            headers: {
              "Access-Control-Allow-Origin": "https://localhost:5173",
              "Access-Control-Allow-Headers": "content-type,authorization",
              "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            },
            body: JSON.stringify({
              error: "User already has access to this device",
            }),
          };
        }
      } else if (method === "DELETE") {
        return {
          statusCode: 404,
          headers: {
            "Access-Control-Allow-Origin": "https://localhost:5173",
            "Access-Control-Allow-Headers": "content-type,authorization",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          },
          body: JSON.stringify({
            error: "Cannot delete access for a user who does not have access",
            device: device,
          }),
        };
      }

      // Add or remove user based on HTTP method
      const isAddingUser = method === "POST";
      const updateParams = {
        TableName: "GarageDevices",
        Key: {
          deviceId: deviceId,
        },
        UpdateExpression: isAddingUser
          ? "SET userAccess = list_append(if_not_exists(userAccess, :empty_list), :targetUser)"
          : "SET userAccess = :newUserAccess",
        ExpressionAttributeValues: isAddingUser
          ? {
              ":targetUser": [targetUserId],
              ":empty_list": [],
            }
          : {
              ":newUserAccess": device.userAccess.filter(
                (id) => id !== targetUserId
              ),
            },
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
          message: isAddingUser
            ? `Access granted successfully to ${targetEmail}`
            : `Access revoked successfully from ${targetEmail}`,
          device: result.Attributes,
        }),
      };
    } catch (error) {
      console.error("Cognito lookup error:", {
        error: error.message,
        code: error.code,
        targetEmail,
      });
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "https://localhost:5173",
          "Access-Control-Allow-Headers": "content-type,authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({ error: "Error looking up user" }),
      };
    }
  } catch (error) {
    console.error("Operation failed:", {
      error: error.message,
      code: error.code,
      stack: error.stack,
      deviceId,
      targetEmail,
      method: event.httpMethod,
    });
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://localhost:5173",
        "Access-Control-Allow-Headers": "content-type,authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        error: "Failed to modify device access",
        debug: {
          errorMessage: error.message,
          errorType: error.name,
          errorStack: error.stack,
        },
      }),
    };
  }
};
