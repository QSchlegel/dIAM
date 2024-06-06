// Core interfaces
import {
    createAgent,
    IDIDManager,
    IResolver,
    IDataStore,
    IDataStoreORM,
    IKeyManager,
    ICredentialPlugin
  } from '@veramo/core'

  import { CredentialIssuerLD } from '@veramo/credential-ld'
  
  // Core identity manager plugin
  import { DIDManager } from '@veramo/did-manager'
  
  // Ethr did identity provider
  import { EthrDIDProvider } from '@veramo/did-provider-ethr'
  
  // Core key manager plugin
  import { KeyManager } from '@veramo/key-manager'
  
  // Custom key management system for RN
  import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
  
  // W3C Verifiable Credential plugin
  import { CredentialIssuer, CredentialPlugin } from '@veramo/credential-w3c'
  
  // Custom resolvers
  import { DIDResolverPlugin } from '@veramo/did-resolver'
  import { Resolver } from 'did-resolver'
  import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
  import { getResolver as webDidResolver } from 'web-did-resolver'
  
  // Storage plugin using TypeOrm
  import { Entities, KeyStore, DIDStore, PrivateKeyStore, migrations } from '@veramo/data-store'
  
  // TypeORM is installed with `@veramo/data-store`
  import { DataSource } from 'typeorm'


// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = 'database.sqlite'

// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = '7000b34a32c940e597e2ae5dab3c83c3'

// This will be the secret key for the KMS (replace this with your secret key)
const KMS_SECRET_KEY =
  '760ea4ee62b40831e2a7faf930a8d870478c42b0afb63b1fccf2141dd3bd3a6a'

  const dbConnection = new DataSource({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: false,
    migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities,
  }).initialize()

  export const agent = createAgent<
  IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver & ICredentialPlugin & CredentialIssuerLD
>({
  plugins: [
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
      },
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: 'did:ethr:sepolia',
      providers: {
        'did:ethr:sepolia': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'sepolia',
          rpcUrl: 'https://sepolia.infura.io/v3/' + INFURA_PROJECT_ID,
          registry: '0x03d5003bf0e79C5F5223588F347ebA39AfbC3818'
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...webDidResolver(),
      }),
    }),
    new CredentialPlugin(),
  ],
})