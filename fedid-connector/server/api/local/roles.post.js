import sql1 from '../../utils/db-local-1';
import sql2 from '../../utils/db-local-2';

/**
 * @property {string} role_id
 * @property {string} user_id
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const query = getQuery(event);
    try {
      
      // Validate the incoming data
      if (!body.role_id || !body.user_id) {
        return { error: 'Missing required fields' };
      }

      var db = sql1;
    if (query && query.db == 2){db = sql2}
  
      // Insert the new user into the database
      const result = await db`
        INSERT INTO public.user_role_mapping (
          role_id,
          user_id
        ) VALUES (
          ${body.role_id},
          ${body.user_id}
        )
        RETURNING *;
      `;
  
      return result[0];
    } catch (err) {
      return { error: err.message };
    }
  });