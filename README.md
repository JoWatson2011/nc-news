# Northcoders News API

`nc-news` is an API which mimics the back-end of a sharing platform such as
Reddit. Users can post articles and interact with posted articles by adding
comments and upvoting/downvoting. It has been built with Node.js and Postgres
and deployed with Render: https://nc-news-2qmw.onrender.com/api

## Configuration

1. Clone the repo

```
git clone https://github.com/JoWatson2011/nc-news.git
```

2. Install dependencies.

```
npm i
```

3. Set up .env files for environment variables.

   There are two .env files required: .env.test and .env .development. These
   should go in root directory

```
echo "PGDATABASE=nc_news_test" > .env.test
echo "PGDATABASE=nc_news" > .env.development
```

4. Setup and seed local databases

```
npm run setup-dbs
npm run seed
```

5. Run tests Test files are found in `__tests__/`

```
npm test
```

## Requirements

The app has been implemented with:

- Node.js v21.6.1
- Postgres v2.7.3

All npm packages/versions can be found in `package.json`

---

This portfolio project was created as part of a Digital Skills Bootcamp in
Software Engineering provided by [Northcoders](https://northcoders.com/)
