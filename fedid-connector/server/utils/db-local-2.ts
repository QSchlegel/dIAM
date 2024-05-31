import postgres from 'postgres'

const sql = postgres({
    host: 'localhost',
    port: 5432, // default PostgreSQL port
    username: 'keycloak_user_2',
    password: 'keycloak123',
    database: 'keycloaki2'
  });

export default sql