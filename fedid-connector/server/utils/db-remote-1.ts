import postgres from 'postgres'

const sql = postgres({
    host: 'localhost',
    port: 5432, // default PostgreSQL port
    username: 'dl_user',
    password: 'dluser123',
    database: 'distributed_ledger'
  });

export default sql