import BaseModel from './base.model.js';

export class directors extends BaseModel{
  constructor( dbConnection ){
    super( 'directors', dbConnection );
  }
}