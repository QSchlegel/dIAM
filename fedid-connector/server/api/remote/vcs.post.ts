
import sql from '../../utils/db-remote-1';
import { VerifiableCredential } from './types';

export default defineEventHandler(async (event) => {
  const body = await readBody<VerifiableCredential>(event);
  try {
    const result = await sql`
    INSERT INTO vc_registry (
        id,
        credential_subject,
        issuer,
        type,
        issuance_date,
        proof
    )
    VALUES (
        ${body.credentialSubject.user.id},
        ${sql.json(body.credentialSubject)},
        ${sql.json(body.issuer)},
        ${body.type},
        ${body.issuanceDate},
        ${sql.json(body.proof)}
    )
    RETURNING *;
  `;
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error inserting data:', error);
    return {
      success: false,
      error: 'Failed to insert data',
    };
  }
});