import { setGlobalOptions } from "firebase-functions/v2";

// Set global options BEFORE importing functions
setGlobalOptions({ 
  maxInstances: 10,
  region: "us-central1"
  // ✅ CORS is set per-function, not globally
});

// Export the function
export { deleteAdminAccount } from './deleteAdmin';
export { deleteCustomerAccount } from './customer/deleteCustomerAccount';


// If you have other functions, export them here too
// export { otherFunction } from './otherFunction';