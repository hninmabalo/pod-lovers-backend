"use strict";
require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
mongoose.connect(MONGO_CONNECTION_STRING, { useNewUrlParser: true });
const db = mongoose.connection;
let token;
const clientKey = process.env.CLIENT_KEY;
const clientSecret = process.env.CLIENT_SECRET;


db.once("open", () => {
  console.log(`Connected to MongoDB at HOST: ${db.host} and PORT: ${db.port}`);
});

db.on("error", (error) => {
  console.log(`Database Error: ${error}`);
});

const axios = require("axios");
const Podcast = require('../models/podcast');
// const { insertMany } = require('../models/podcast');

axios({
  url: "https://api.podchaser.com/graphql",
  method: "post",
  data: {
    query: `
      mutation {
          requestAccessToken(
              input: {
                  grant_type: CLIENT_CREDENTIALS
                  client_id: "${clientKey}"
                  client_secret: "${clientSecret}"
              }
          ) {
              access_token
          }
      }
        `,
  },
})
  .then((result) => {
    console.log(result.data);
    token = result.data.data.requestAccessToken.access_token;
    const randPodcasts = {
      method: "post",
      url: "https://api.podchaser.com/graphql",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        query: `query {
            podcasts(searchTerm: "Reply All") {
                paginatorInfo {
                    currentPage,
                    hasMorePages,
                    lastPage,
                },
                data {
                    id,
                    title,
                    description,
                    webUrl,
                }
            }
        }`,
      },
    };
    axios
      .request(randPodcasts)
      .then((response) => {
        console.log('Podcast....', response);
        let newPodcasts = [];
        // response.data.data.podcasts.data.forEach((podcast) => {
        //   newPodcasts.push({
        //     imageUrl: podcast.imageUrl,
        //     title: podcast.title,
        //     description: podcast.description,
        //   });
        // });
        // Podcast.insertMany(newPodcasts)
        // .then(response => {
        //     console.log(response)
        // })
        // .catch((error) => {
        //     console.log('error', error)
        // })
      })
      .catch((error) => {
        console.log("error", error);
      });
  })
  .catch((error) => {
    console.log("error", error);
  });