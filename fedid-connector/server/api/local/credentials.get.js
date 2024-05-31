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
    const query = getQuery(event);

    var db = sql1;
    if (query && query.db == 2){db = sql2}

    try {
        let credentials;
        if (query && query.id) {
            credentials = await db`
        SELECT 
          id,
          salt,
          type,
          user_id,
          created_date,
          user_label,
          secret_data,
          credential_data,
          priority
        FROM public.Credential 
        WHERE id = ${query.id}`;
            return credentials[0];
        }

        credentials = await db`
      SELECT 
        id,
        salt,
        type,
        user_id,
        created_date,
        user_label,
        secret_data,
        credential_data,
        priority
      FROM public.Credential`;
        return credentials;
    } catch (err) {
        return { error: err.message };
    }
});