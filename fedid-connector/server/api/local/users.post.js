import sql1 from '../../utils/db-local-1';
import sql2 from '../../utils/db-local-2';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string|null} email
 * @property {string} email_constraint
 * @property {boolean} email_verified
 * @property {boolean} enabled
 * @property {string|null} federation_link
 * @property {string|null} first_name
 * @property {string|null} last_name
 * @property {string} realm_id
 * @property {string} username
 * @property {string} created_timestamp
 * @property {string|null} service_account_client_link
 * @property {number} not_before
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const query = getQuery(event);
    try {
      
      // Validate the incoming data
      if (!body.id || !body.username || !body.realm_id || !body.created_timestamp) {
        return { error: 'Missing required fields' };
      }

      var db = sql1;
    if (query && query.db == 2){db = sql2}
  
      // Insert the new user into the database
      const result = await db`
        INSERT INTO public.user_entity (
          id,
          email,
          email_constraint,
          email_verified,
          enabled,
          federation_link,
          first_name,
          last_name,
          realm_id,
          username,
          created_timestamp,
          service_account_client_link,
          not_before
        ) VALUES (
          ${body.id},
          ${body.email},
          ${body.email_constraint},
          ${body.email_verified},
          ${body.enabled},
          ${body.federation_link},
          ${body.first_name},
          ${body.last_name},
          ${body.realm_id},
          ${body.username},
          ${body.created_timestamp},
          ${body.service_account_client_link},
          ${body.not_before}
        )
        RETURNING *;
      `;
  
      return result[0];
    } catch (err) {
      return { error: err.message };
    }
  });