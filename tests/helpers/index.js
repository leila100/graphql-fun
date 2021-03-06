import { createClient } from "./createClient";
import gql from "graphql-tag";

let client = createClient();

export * from "./db";

export const vote = async (token, tally) => {
  global.token = token;
  const { data } = client.mutate({
    mutation: gql`
      mutation vote($tally: Boolean!) {
        vote(tally: $tally)
      }
    `,
    variables: { tally }
  });
  return data;
};

export const subscribePlayerInstructions = async token => {
  global.token = token;

  //
  //  TODO Subscribe player
  //    - listen to subscriptions
  //    - handle callback
  //    - unsubscribe
  //
};

export const subscribeBoardGame = async callback => {
  global.token = process.env.ADMIN_SECRET;
  const listenForBoard = client
    .subscribe({
      query: gql`
        subscription boardStatus {
          callout {
            name
            state
            ... on AudiencePoll {
              results {
                question
                yesLabel
                noLabel
                yes
                no
              }
            }
          }
        }
      `
    })
    .subscribe(callback);
  return () => listenForBoard.unsubscribe();
};

export const startAudiencePoll = async (question, yesLabel, noLabel) => {
  global.token = process.env.ADMIN_SECRET;
  const { data } = await client.mutate({
    mutation: gql`
      mutation start($question: String, $yesLabel: String, $noLabel: String) {
        startAudiencePoll(
          question: $question
          yesLabel: $yesLabel
          noLabel: $noLabel
        ) {
          question
          yesLabel
          noLabel
          yes
          no
        }
      }
    `,
    variables: { question, yesLabel, noLabel }
  });
  return data;
};

export const getCurrentCallout = async () => {
  global.token = process.env.ADMIN_SECRET;
  const { data } = await client.query({
    query: gql`
      query currentCallout {
        callout {
          name
          state
          ... on AudiencePoll {
            results {
              question
              yesLabel
              noLabel
              yes
              no
            }
          }
        }
      }
    `
  });
  return data;
};

export const endCallout = async () => {
  global.token = process.env.ADMIN_SECRET;
  const { data } = await client.mutate({
    mutation: gql`
      mutation end {
        endCallout
      }
    `
  });
  return data;
};

export const meQuery = async token => {
  global.token = token;
  const { data } = await client.query({
    query: gql`
      query me {
        me {
          login
          name
          avatar
          hometown
        }
      }
    `
  });
  return data;
};

export const putPlayerBack = async login => {
  global.token = process.env.ADMIN_SECRET;
  const { data } = await client.mutate({
    mutation: gql`
      mutation putBack($login: ID) {
        putBackPlayer(login: $login) {
          count
          player {
            login
          }
        }
      }
    `,
    variables: { login }
  });
  return data;
};

export const queryOnDeck = async () => {
  const { data } = await client.query({
    query: gql`
      query listPlayersOnDeck {
        playerCount(onDeck: true)
        allPlayers(onDeck: true) {
          login
        }
      }
    `
  });
  return data;
};

export const pickPlayer = async () => {
  global.token = process.env.ADMIN_SECRET;
  const { data } = await client.mutate({
    mutation: gql`
      mutation pickPlayer {
        pickPlayer {
          count
          player {
            login
          }
        }
      }
    `
  });
  return data;
};

export const createTestPlayers = async (count = 1) => {
  const players = [];
  for (let i = 0; i < count; i++) {
    players.push(await authorizeTestUser());
  }
  return players;
};

export const getGithubAuthUrl = async () => {
  const { data } = await client.query({
    query: gql`
      query githubUrl {
        githubAuthorizationUrl
      }
    `
  });
  return data;
};

export const queryPlayers = async () => {
  const { data } = await client.query({
    query: gql`
      query listPlayers {
        playerCount
        allPlayers {
          login
          name
          hometown
          avatar
        }
      }
    `
  });
  return data;
};

export const authorizeTestUser = async () => {
  const { data } = await client.mutate({
    mutation: gql`
      mutation auth {
        githubAuthorization(code: "TEST_PLAYER") {
          token
          player {
            login
            name
            hometown
            avatar
          }
        }
      }
    `
  });
  return data;
};
