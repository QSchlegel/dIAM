import { agent } from '../../utils/veramo/setup'

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    if ( body ){
        return await agent.verifyCredential({
    credential: body,
  })
    }

})