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
  const { signOut } = useAuthenticator((context) => [context.user]);

 

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


   // Run this once on component mount to load the script
   useEffect(() => {
    // Function to initialize the embedded messaging
    function initEmbeddedMessaging() {
      try {
		fetchUserProfile();  
		console.log(userprofiles);
        // Assuming `embeddedservice_bootstrap` is available globally
        embeddedservice_bootstrap.settings.language = 'en_US';  // Set language (as an example)
		
		window.addEventListener("onEmbeddedMessagingReady", () => 
        {
            console.log("Received the onEmbeddedMessagingReady event…");

            // Send token to Salesforce
    
            embeddedservice_bootstrap.userVerificationAPI.setIdentityToken
            ({
            identityTokenType : "JWT", 

            //identityToken :"{The JWT token key value that we created in Stage 4}"
            identityToken :"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFkbWluVGVzdCJ9.eyJzdWIiOiJzdGVwaGVubXdtb2tAZ21haWwuY29tIiwiaXNzIjoiU01PSyIsImV4cCI6MTc2NjE1Mjk5OH0.a-ffQv0Y1j9vrRyw4pqFbPEtVpMsYYGxocUmgHWnFj61Dr7wL4jFhFYIcET0dM0vVI5CFeODTfj6uSWPmT5QumG3iykf8E8domditJ8f4sP68LnIYazuq_NPmg7agfj9LNpUYfG3Id4aWklRA-OCWJOOZb1wEFQ-LBQiBJLFd4Awqx6EfehaeBHCZZMhKeNqv7Gqsl42rI2MP3xj89VOL1HI5YLZVo3nDrsbDeFM19_edP1eIMkoVA04kQ1C21fgSPH3rY9T4HexnnnIZe_EEezxVuAn8l0T6oJifd4o29fIkKDYzdUW1bFlDzYxjESQME-WeWu_AP93XdC6OzuFvQ"
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
