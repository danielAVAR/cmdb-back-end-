export default class UserReactionDto {
  constructor(data) {
    this.reviewId = data.reviewId;
    this.reaction = data.reaction;
  }
}
