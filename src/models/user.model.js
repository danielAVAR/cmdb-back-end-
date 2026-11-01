import BaseModel from './base.model.js';

export class users extends BaseModel{
  constructor( dbConnection ){
    super( 'users', dbConnection );
  }
}