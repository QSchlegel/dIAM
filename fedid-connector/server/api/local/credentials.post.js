import sql1 from '../../utils/db-local-1';
import sql2 from '../../utils/db-local-2';

/**
 * @typedef {Object} Credential
 * @property {string} id
 * @property {string|null} salt
 * @property {string} type
 * @property {string} user_id
 * @property {string} created_date
 * @property {string|null} user_label
 * @property {string} secret_data
 * @property {string} credential_data
 * @property {number} priority
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const query = getQuery(event);
    try {
        // Validate the incoming data
    if (!body.id || !body.type || !body.user_id || !body.created_date || !body.secret_data || !body.credential_data || body.priority === undefined) {
      return { error: 'Missing required fields' };
    }

    var db = sql1;
    if (query && query.db == 2){db = sql2}

    // Insert the new credential into the database
    const result = await db`
      INSERT INTO public.Credential (
        id,
        salt,
        type,
        user_id,
        created_date,
        user_label,
        secret_data,
        credential_data,
        priority
      ) VALUES (
        ${body.id},
        ${body.salt},
        ${body.type},
        ${body.user_id},
        ${body.created_date},
        ${body.user_label},
        ${body.secret_data},
        ${body.credential_data},
        ${body.priority}
      )
      RETURNING *;
    `;

    return result[0];
    } catch (err) {
        return { error: err.message };
    }
});