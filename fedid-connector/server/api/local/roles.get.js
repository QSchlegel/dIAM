import sql1 from '../../utils/db-local-1';
import sql2 from '../../utils/db-local-2';

/**
 * @property {string} role_id
 * @property {string} user_id
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
        role_id,
        user_id
        FROM public.user_user_role_mapping 
        WHERE user_id = ${query.id}`;
            return users[0];
        } else {
            users = await db`
        SELECT 
        role_id,
        user_id
        FROM public.user_role_mapping`;
            return users;
        }
    } catch (err) {
        return { error: err.message };
    }
});