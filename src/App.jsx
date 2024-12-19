import { useState, useEffect } from "react";
import {
  Button,
  Heading,
  Flex,
  View,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from '@aws-amplify/auth';
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */
Amplify.configure(outputs);
const client = generateClient({
  authMode: "userPool",
});

export default function App() {
  const [userprofiles, setUserProfiles] = useState([]);
  const { signOut, user } = useAuthenticator((context) => [context.user]);
  const [session, setSession] = useState(null);

  // Fetch user profile data
  function fetchUserProfile() {
    client.models.UserProfile.list()
      .then(response => {
        const profiles = response.data;
        setUserProfiles(profiles);
      })
      .catch(error => {
        console.error("Error fetching user profiles:", error);
      });
  }

  // Fetch the authentication session asynchronously
  useEffect(() => {
    async function fetchSession() {
      try {
        const session = await fetchAuthSession();
        setSession(session);  // Store session in state
      } catch (error) {
        console.error("Error fetching auth session:", error);
      }
    }

    fetchSession();  // Invoke async function inside useEffect
  }, []);

  // Retrieve the ID Token
  const getIdToken = () => {
    if (user && user.signInUserSession) {
      const idToken = user.signInUserSession.idToken.jwtToken;
      console.log("ID Token:", idToken);
      return idToken;
    }
    return null;
  };

  // Run once on component mount to load the external script and initialize messaging
  useEffect(() => {
    // Function to initialize the embedded messaging
    function initEmbeddedMessaging() {
      try {
        client.models.UserProfile.list()
          .then(response => {
            const profiles = response.data;
            console.log(profiles);
            setUserProfiles(profiles);

            console.log(userprofiles);

            // Ensure session is available before attempting to use tokens
            if (session) {
              console.log('Access Token:', session.tokens.accessToken.toString());
              console.log('ID Token:', session.tokens.idToken.toString());

              // Assuming `embeddedservice_bootstrap` is available globally
              embeddedservice_bootstrap.settings.language = 'en_US';  // Set language (as an example)

              window.addEventListener("onEmbeddedMessagingReady", () => {
                console.log("Received the onEmbeddedMessagingReady event…");

                // Send token to Salesforce
                embeddedservice_bootstrap.userVerificationAPI.setIdentityToken({
                  identityTokenType: "JWT", 
                  identityToken: session.tokens.idToken.toString()  // Correct usage of session token
                });
              });

              embeddedservice_bootstrap.init(
                '00DHu00000B6CWL',
                'customSite',
                'https://sl1730395447847.my.site.com/ESWcustomSite1734566894070',
                {
                  scrt2URL: 'https://sl1730395447847.my.salesforce-scrt.com'
                }
              );
            }
          })
          .catch(error => {
            console.error("Error fetching user profiles:", error);
          });
      } catch (err) {
        console.error('Error loading Embedded Messaging: ', err);
      }
    }

    // Dynamically create and add the script tag to load the external script
    const script = document.createElement('script');
    script.src = 'https://sl1730395447847.my.site.com/ESWX407etr1732130422409/assets/js/bootstrap.min.js';
    script.type = 'text/javascript';
    script.onload = initEmbeddedMessaging; // Initialize messaging once the script loads
    document.body.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, [session]); // Dependency on session to run after session is fetched

  return (
    <Flex
      className="App"
      justifyContent="center"
      alignItems="center"
      direction="column"
      width="70%"
      margin="0 auto"
    >
      <Heading level={1}>My Profile</Heading>

      <Divider />

      <Grid
        margin="3rem 0"
        autoFlow="column"
        justifyContent="center"
        gap="2rem"
        alignContent="center"
      >
        {userprofiles.map((userprofile) => (
          <Flex
            key={userprofile.id || userprofile.email}
            direction="column"
            justifyContent="center"
            alignItems="center"
            gap="2rem"
            border="1px solid #ccc"
            padding="2rem"
            borderRadius="5%"
            className="box"
          >
            <View>
              <Heading level="3">{userprofile.email}</Heading>
            </View>
          </Flex>
        ))}
      </Grid>
      <Button onClick={signOut}>Sign Out</Button>
    </Flex>
  );
}
