import sql from '../../utils/db-remote-1';
import { VerifiableCredential } from './types';
import { H3Error } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const email = query.email as string | undefined;
  const id = query.id as string | undefined;

  try {
    let result: VerifiableCredential[];

    if (email && id) {
      result = await sql<VerifiableCredential[]>`
        SELECT *
        FROM vc_registry
        WHERE credential_subject->'user'->>'email' ILIKE ${'%' + email + '%'}
          AND credential_subject->'user'->>'id' = ${id}
      `;
    } else if (email) {
      result = await sql<VerifiableCredential[]>`
        SELECT *
        FROM vc_registry
        WHERE credential_subject->'user'->>'email' ILIKE ${'%' + email + '%'}
      `;
    } else if (id) {
      result = await sql<VerifiableCredential[]>`
        SELECT *
        FROM vc_registry
        WHERE credential_subject->'user'->>'id' = ${id}
      `;
    } else {
      result = await sql<VerifiableCredential[]>`
        SELECT *
        FROM vc_registry
      `;
    }

    if (result.length === 0) {
      const error: H3Error = {
        statusCode: 404,
        message: 'No records found',
      };
      return sendError(event, error);
    }

    return result.map(record => ({
      credentialSubject: {
        user: {
          id: record.credential_subject.user.id,
          email: record.credential_subject.user.email,
          first_name: record.credential_subject.user.first_name,
          last_name: record.credential_subject.user.last_name,
          username: record.credential_subject.user.username,
          created_timestamp: record.credential_subject.user.created_timestamp,
        },
        credential: {
          user_label: record.credential_subject.credential.user_label,
          created_date: record.credential_subject.credential.created_date,
          passkey: {
            aaguid: record.credential_subject.credential.passkey.aaguid,
            credentialId: record.credential_subject.credential.passkey.credentialId,
            counter: record.credential_subject.credential.passkey.counter,
            credentialPublicKey: record.credential_subject.credential.passkey.credentialPublicKey,
            attestationStatementFormat: record.credential_subject.credential.passkey.attestationStatementFormat,
            transports: record.credential_subject.credential.passkey.transports,
          },
        },
      },
      issuer: record.issuer,
      type: record.type,
      '@context': [ "https://www.w3.org/2018/credentials/v1" ],
      issuanceDate: record.issuance_date,
      proof: {
        type: record.proof.type,
        jwt: record.proof.jwt
      },
    }));
  } catch (error) {
    console.error('Error reading data:', error);
    const err: H3Error = {
      statusCode: 500,
      message: 'Failed to read data',
    };
    return sendError(event, err);
  }
});