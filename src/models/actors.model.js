import BaseModel from './base.model.js';

export class ActorsModel extends BaseModel {
  constructor( dbConnection ){
    super( 'actors', dbConnection );
  }
}
