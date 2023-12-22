# News-API
A News API site built on Node.js using Express and Mongoose

![image](https://user-images.githubusercontent.com/31624329/195980619-4779b6d0-abed-492a-b529-1ac562cd3250.png)

Steps to run the program.
1. Open the project in some IDE like Visual Code.
2. Install MongoDB to be able to connect the database in the app(The project automatically creates a database and the required collections).
3. You will just need to enter valid data in the table from the app itself to see it getting displayed on the app.

Add Quick Search items instead of categories
Add Bulk delete of all news articles from the database instead of delete duplicate sources
For User Review add username and email as placeholder and Ask for review in text area.
Remove usernames in the bottom and extend user review space
In the home screen show a text that "No News Articles present in the Database. Click below to fetch 100 articles from NEWS API. Button below" and display all news on the page with pagination
Delete Source Model and make source object in articles
Remove Source JSON and include both in Article JSON

Default News Article in placeholder
{
-"source": {
"id": null,
"name": "People.cn"
},
"author": "F_126",
"title": "Uncovering the hidden truths behind US economic data",
"description": "The U.S. economy showed impressive performance in the first three quarters of 2023, despite continuo",
"url": "http://en.people.cn/n3/2023/1220/c90000-20112760.html",
"urlToImage": null,
"publishedAt": "2023-12-20T06:03:33Z",
"content": "The U.S. economy showed impressive performance in the first three quarters of 2023, despite continuous interest rate hikes by the Federal Reserve. This performance included record-breaking stock mark… [+9570 chars]"
}