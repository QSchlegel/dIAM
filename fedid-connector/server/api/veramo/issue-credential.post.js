import { agent } from '../../utils/veramo/setup'

export default defineEventHandler(async (event) => {
    //Parameterize the endpoint
    const query = getQuery(event);
    const body = await readBody(event);

    if (query && body && query.alias) {

        const identifier = (await agent.didManagerFind({ alias: query.alias })).pop()

        if (identifier && identifier.did) {

            const verifiableCredential = await agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    credentialSubject: {
                        id: body.user_id,
                        created_date: body.created_date,
                        passkey: JSON.parse(body.credential_data),
                    },
                },
                proofFormat: 'jwt',
            })

            return verifiableCredential;
        }

    }
})