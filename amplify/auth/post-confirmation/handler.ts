import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { type Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/post-confirmation";
import { createUserProfile } from "./graphql/mutations";
import * as AWS from 'aws-sdk';

Amplify.configure(
  {
    API: {
      GraphQL: {
        endpoint: env.AMPLIFY_DATA_GRAPHQL_ENDPOINT,
        region: env.AWS_REGION,
        defaultAuthMode: "iam",
      },
    },
  },
  {
    Auth: {
      credentialsProvider: {
        getCredentialsAndIdentityId: async () => ({
          credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            sessionToken: env.AWS_SESSION_TOKEN,
          },
        }),
        clearCredentialsAndIdentityId: () => {
          /* noop */
        },
      },
    },
  }
);

const client = generateClient<Schema>({
  authMode: "iam",
});

const lambda = new AWS.Lambda();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log(JSON.stringify(event));
  await client.graphql({
    query: createUserProfile,
    variables: {
      input: {
        email: event.request.userAttributes.email,
        givenName: event.request.userAttributes.given_name,
        familyName: event.request.userAttributes.family_name,
        profileOwner: `${event.request.userAttributes.sub}::${event.userName}`,
      },
    },
  });

  const lambdaParams = {
    FunctionName: 'arn:aws:lambda:us-east-1:863615190391:function:slalomAccountCreation-lambda-fn',  // Replace with your Lambda function name
    InvocationType: 'Event',  // Asynchronous invocation
    Payload: JSON.stringify(event),
  };

  // Call another Lambda function
  try {
    const lambdaResponse = await lambda.invoke(lambdaParams).promise();
    console.log("Successfully invoked Lambda:", lambdaResponse);
  } catch (error) {
    console.error("Error invoking Lambda:", error);
  }

  return event;
};