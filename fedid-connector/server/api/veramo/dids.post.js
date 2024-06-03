import { agent } from '../../utils/veramo/setup'

export default defineEventHandler(async (event) => {
    //Parameterize the endpoint
    const query = getQuery(event);
    var alias = (query && query.alias)? query.alias : 'default'

    const identifier = await agent.didManagerCreate({ alias: alias })
    return identifier;
})