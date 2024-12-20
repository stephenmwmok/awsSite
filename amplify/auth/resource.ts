import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from './post-confirmation/resource';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
    
  userAttributes: {
    // specify a "birthdate" attribute
    givenName: {
      mutable: true,
      required: true
    },
    familyName: {
      mutable: true,
      required: true
    }
  },
  triggers: {
    postConfirmation
  }
});