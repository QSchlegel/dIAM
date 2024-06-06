// types.ts
export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    created_timestamp: string;
  }
  
  export interface Passkey {
    aaguid: string;
    credentialId: string;
    counter: number;
    credentialPublicKey: string;
    attestationStatementFormat: string;
    transports: string[];
  }
  
  export interface Credential {
    user_label: string;
    created_date: string;
    passkey: Passkey;
  }
  
  export interface CredentialSubject {
    user: User;
    credential: Credential;
  }
  
  export interface Issuer {
    id: string;
  }
  
  export interface Proof {
    type: string;
    jwt: string;
  }

  export interface VerifiableCredential {
    credentialSubject: CredentialSubject;
    issuer: Issuer;
    type: string[];
    '@context': string[];
    issuanceDate: string;
    proof: Proof;
  }
  
  export interface VerifiableCredential2 {
    credential_subject: CredentialSubject;
    issuer: Issuer;
    type: string[];
    '@context': string[];
    issuance_date: string;
    proof: Proof;
  }