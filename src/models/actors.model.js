import BaseModel from './base.model.js';

export class actors extends BaseModel{
  constructor( dbConnection ){
    super( 'actors', dbConnection );
  }
}