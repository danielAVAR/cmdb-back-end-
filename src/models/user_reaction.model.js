import BaseModel from './base.model.js';

export class UserReactionModel extends BaseModel {
  constructor( dbConnection ){
    super( 'user_reactions', dbConnection );
  }
}
