<h1 align="center">Welcome to `appwrite-typer` 👋</h1>

> CLI tool to generate Typescript definitions for your Appwrite collections.

*This is fork of a deprecated repo https://github.com/TorstenDittmann/appwrite-types-generator upgraded.*

![code](https://github.com/orenaksakal/appwrite-typer/assets/199699/8e5c3d06-d2a5-477b-b77a-37fa9492b25d)



## Install

```sh
npm i appwrite-typer
```

## CLI Usage

```sh
aw-typer generate -c config.json -o types/ 
```

## package.json

```json
{
    "scripts": {
        "types": "aw-typer generate -c config.json -o types/"
    }
}
```

## config.json

```json
{
  "endpoint": "https://cloud.appwrite.io/v1",
  "projectId": "6588091....",
  "databaseId": "658827....",
  "apiKey": "0da035ee4c522d239446c93b...."
}

```

## Languages supported
- typescript

## Author
👤 **Oren Aksakal**

* Twitter: [@orenaksakal](https://twitter.com/orenaksakal)
* Github: [@orenaksakal](https://github.com/orenaksakal)


## Credits to

👤 **Torsten Dittmann**
* Website: https://dittmann.dev
* Twitter: [@DittmannTorsten](https://twitter.com/DittmannTorsten)
* Github: [@TorstenDittmann](https://github.com/TorstenDittmann)
