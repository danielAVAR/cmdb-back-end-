
export default class BaseModel {
  #dbConn;
  #table;
  constructor( repo, dbConnection ){
    this.#dbConn = dbConnection;
    this.#table = repo;
  }

  get table(){ return this.#table };
  get dbConn(){ return this.#dbConn };

  async create( data ){
    try{
      const fields = Object.keys(data);
      const query = `INSERT INTO ${this.#table} ( ${ fields.join(', ') } ) VALUES ( ${ fields.map( f => '?').join(', ') } )`;
      const [ result ] = await this.#dbConn.execute( query, fields.map( f => data[f] ));
      return result.insertId;
    } 
    catch( err ){
      console.log( err );
    }
  }

  async getAll(){
    try{
      const query = `SELECT * FROM ${ this.#table };`;
      const [ result ] = await this.#dbConn.query( query );
      return result;
    }
    catch( err ){
      console.log( err );
    }
  }

  async getById( id ){
    try{
      const query = `SELECT * FROM ${ this.#table } WHERE id = ?;`;
      const [ result ] = await this.#dbConn.execute( query, [ id ] );
      return result[0];
    }
    catch( err ){
      console.log( err );
    }
  }


}