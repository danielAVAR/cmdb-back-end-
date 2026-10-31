export default class MovieDto {
  constructor(data) {
    this.movieName = data.movieName;
    this.overview = data.overview;
    this.releaseYear = data.releaseYear;
    this.imageUrl = data.imageUrl;
    this.runtime = data.runtime;
    this.budget = data.budget;
    this.grossWorldwide = data.grossWorldwide;
  }
}
