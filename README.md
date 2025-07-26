# News-API

A full-featured News API web application built with Node.js, Express, MongoDB (Mongoose), and Handlebars. It allows users to fetch, view, create, update, and delete news articles, as well as review the app and manage users.

![Screenshot](https://user-images.githubusercontent.com/31624329/195980619-4779b6d0-abed-492a-b529-1ac562cd3250.png)

## Features

- Fetch latest news articles from an external API and store in MongoDB
- View all news articles with pagination and modern UI
- Quick Search for articles by keyword
- Bulk delete all news articles
- Update and delete individual articles
- User review form with username and email placeholders
- Responsive design with Bootstrap
- Remove duplicate articles and users
- Source is now an object inside each article

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/abhis201/News-API.git
   cd News-API
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start MongoDB locally (default port 27017).
4. Start the app:
   ```bash
   npm start
   # or
   nodemon index.js
   ```

### Usage
- Open [http://localhost:3000](http://localhost:3000) in your browser.
- Use the navigation bar to view categories, search, or view all news.
- If no articles are present, click the button to fetch 100 articles from the News API.
- Use the bulk delete button to remove all articles.
- Update or delete individual articles using the buttons on each card.
- Submit a review using the form on the right.

## Data Model

Example News Article JSON:
```json
{
  "source": {
    "id": null,
    "name": "People.cn"
  },
  "author": "F_126",
  "title": "Uncovering the hidden truths behind US economic data",
  "description": "The U.S. economy showed impressive performance in the first three quarters of 2023, despite continuous interest rate hikes by the Federal Reserve.",
  "url": "http://en.people.cn/n3/2023/1220/c90000-20112760.html",
  "urlToImage": null,
  "publishedAt": "2023-12-20T06:03:33Z",
  "content": "The U.S. economy showed impressive performance in the first three quarters of 2023, despite continuous interest rate hikes by the Federal Reserve. This performance included record-breaking stock mark… [+9570 chars]"
}
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT