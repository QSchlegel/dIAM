import { agent } from '../../utils/veramo/setup'

export default defineEventHandler(async (event) => {
    //Parameterize the endpoint
    const query = getQuery(event || "default");
    const body = await readBody(event);

    try {
        if (query && body && query.alias && body.credential && body.user) {
            const identifier = (await agent.didManagerFind({ alias: query.alias })).pop()
            if (identifier && identifier.did) {
                const verifiableCredential = await agent.createVerifiableCredential({
                    credential: {
                        issuer: { id: identifier.did },
                        credentialSubject: {
                            user: body.user,
                            credential: body.credential
                        },
                    },
                    proofFormat: 'jwt',
                })
                return verifiableCredential;
            }
        }
    } catch (error) {
        return error
    }
})