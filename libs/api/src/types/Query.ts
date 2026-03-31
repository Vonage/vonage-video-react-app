export interface Query {
  [key: string]: undefined | string | Query | (string | Query)[];
}

export default Query;
