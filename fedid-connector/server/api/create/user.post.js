// server/api/create/user.post.js
import { defineEventHandler, readBody } from 'h3';
import { createHash } from 'crypto';
import blake2 from 'blake2';

export default defineEventHandler(async (event) => {
  // Parse the request body
  const body = await readBody(event);

  // Extract fields from the body
  const {
    aaguid,
    attestationStatementFormat,
    counter,
    credentialId,
    credentialPublicKey,
  } = body;

  // Apply SHA3-256 to the credentialPublicKey
  const sha3Hash = createHash('sha3-256');
  sha3Hash.update(Buffer.from(credentialPublicKey, 'base64'));
  const sha3HashedKey = sha3Hash.digest();

  // Apply Blake2b to the result of SHA3-256
  const blake2bHash = blake2.createHash('blake2b', { digestLength: 32 });
  blake2bHash.update(sha3HashedKey);
  const finalHashedKey = blake2bHash.digest('hex');

  // Log the final hash (optional)
  console.log('Final Hashed Public Key:', finalHashedKey);

  // Send a response back to the client
  return {
    status: 'success',
    message: 'User data received and processed successfully',
    receivedData: {
      ...body,
      finalHashedKey,
    },
  };
});
