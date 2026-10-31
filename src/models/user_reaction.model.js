import BaseModel from './base.model.js';

export class user_reaction extends BaseModel{
  constructor( dbConnection ){
    super( 'user_reactions', dbConnection );
  }
}