import BaseModel from './base.model.js';

export class DirectorsModel extends BaseModel {
  constructor( dbConnection ){
    super( 'directors', dbConnection );
  }
}
