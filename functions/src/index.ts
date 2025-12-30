import { setGlobalOptions } from "firebase-functions/v2";

// Set global options BEFORE importing functions
setGlobalOptions({ 
  maxInstances: 10,
  region: "us-central1" // or your preferred region
});

// Export the function
export { deleteAdminAccount } from './deleteAdmin';

// If you have other functions, export them here too
// export { otherFunction } from './otherFunction';