export default class ReviewDto {
  constructor(data) {
    this.movieId = data.movieId;
    this.title = data.title;
    this.comment = data.comment;
    this.rating = data.rating;
  }
}
