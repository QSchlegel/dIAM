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
    const query = getQuery(event)

    var db = sql1;
    if (query && query.db == 2){db = sql2}
    
    try {
        let users;
        if (query && query.id) {
            users = await db`
        SELECT 
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
        FROM public.user_entity 
        WHERE id = ${query.id}`;
            return users[0];
        } else {
            users = await db`
        SELECT 
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
        FROM public.user_entity`;
            return users;
        }
    } catch (err) {
        return { error: err.message };
    }
});