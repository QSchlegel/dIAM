import { agent } from '../../utils/veramo/setup'

export default defineEventHandler(async (event) => {
    //Parameterize the endpoint
    const query = getQuery(event);

    const identifiers = (query && query.alias) ? 
        await agent.didManagerFind({alias:query.alias}) : 
        await agent.didManagerFind()
        
    return identifiers;
})