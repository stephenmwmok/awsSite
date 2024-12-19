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
import { Amplify, Auth } from "aws-amplify";
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
  const { signOut } = useAuthenticator((context) => [context.user]);

  // Fetch user profiles
  async function fetchUserProfile() {
    try {
      const response = await client.models.UserProfile.list();
      const profiles = response.data;
      setUserProfiles(profiles);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
    }
  }

  useEffect(() => {
    // Initialize the embedded messaging script and fetch user profiles
    async function initEmbeddedMessaging() {
      try {
        // Fetch user profiles and set them in state
        await fetchUserProfile();  // Fetch profiles asynchronously

        // Get the current session and extract the JWT token
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();

        console.log("User Profiles:", userprofiles); // User profiles are now set
        console.log("JWT Token:", idToken); // JWT Token from current session

        // Assuming `embeddedservice_bootstrap` is available globally
        embeddedservice_bootstrap.settings.language = "en_US"; // Set language

        window.addEventListener("onEmbeddedMessagingReady", () => {
          console.log("Received the onEmbeddedMessagingReady event…");

          // Send token to Salesforce
          embeddedservice_bootstrap.userVerificationAPI.setIdentityToken({
            identityTokenType: "JWT",
            identityToken: idToken,
          });
        });

        embeddedservice_bootstrap.init(
          "00DHu00000B6CWL",
          "customSite",
          "https://sl1730395447847.my.site.com/ESWcustomSite1734566894070",
          {
            scrt2URL: "https://sl1730395447847.my.salesforce-scrt.com",
          }
        );
      } catch (err) {
        console.error("Error loading Embedded Messaging: ", err);
      }
    }

    // Dynamically create and add the script tag to load the external script
    const script = document.createElement("script");
    script.src =
      "https://sl1730395447847.my.site.com/ESWX407etr1732130422409/assets/js/bootstrap.min.js";
    script.type = "text/javascript";
    script.onload = initEmbeddedMessaging; // Initialize messaging once the script loads
    document.body.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []); // Empty dependency array ensures it runs once on mount

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
