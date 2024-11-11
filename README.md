# Backend README file

# NodeJS Boilerplate API

NodeJS Rest API developed with Express.

## Versions

Each branch has a different version of the API:

- **Master:** [A NodeAPI that uses Express + Sequelize + MySQL](https://github.com/lucascraveiropaes/node-js-boilerplate)
- **Mongo:** [A NodeAPI that uses Express + MongoDB](https://github.com/lucascraveiropaes/node-js-boilerplate/tree/mongo)

## Download and installation

Download the project:

```git
git clone https://github.com/lucascraveiropaes/node-js-boilerplate.git
```

Install all dependencies:

```bash
npm install
```

Run the most recent migration to create and update the database (explanation below).  
**Note:** The database must be created before performing the migration, and the name must be **app**.

Finally, start the server:

```bash
npm run start
```

## Principais Dependências

- [Sequelize](https://sequelize.org)
- [Express](https://expressjs.com)
- [Nodemailer](https://nodemailer.com/about)
- [Mysql2](https://github.com/sidorares/node-mysql2)

## Migrations

Migrations are used to create database changes through scripts, not manual changes. The library used is the own [sequelize migration](https://sequelize.org/master/manual/migrations.html).

**Create a migration**

```bash
npx sequelize migration:create --name=<nome-do-script>
```

Within the file created in the `src/migrations` folder, add the code for the required changes:

```js
"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Users");
  },
};
```

**Execute migration**

```bash
npx sequelize db:migrate
```

**Undo the last migration**

```
npx sequelize-cli db:migrate:undo
```

**Resposta**

```
NodeJS Boilerplate API - v0.1
```

---

# FRONTEND README file

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

### Params defination
#------------------------#
| param1 = serviceId,    |
| param2 = partner_id,   |
| param3 = subSrc,       |
| param4 = campaignId,   |
| param5 = user ip,      |
| param6 = number,       |
| param7 = userAgent,    |
| param8 = pin,          |
| param9 = medium,       |
| param10 = token,       |
| param11 = sourceId,    |
| param12 = mcpUniqueId, |
#------------------------#
        