const { ApolloServer, gql } = require("apollo-server-express");
const { unlink, createWriteStream, existsSync, mkdirSync, writeFile, readFile, appendFile } = require("fs");
const path = require("path");
const express = require("express");
const axios = require("axios");

const Desc = require('./Desc');
require('./config');

const typeDefs = gql`
  type Query {
    files: [String]
    datafiles: [Description]
  }

  type Mutation {
    uploadFile(files: [Upload], data: [String]): Boolean
    uploadMultipleFiles(file: Upload!, desc: String): Boolean
    testAppendDesc(desc: String): Description
    testMultipleAppendDesc(desc: [String]): [Description]
    deleteDesc(id: ID!): Boolean
  }

  type Description {
    id: ID!
    description: String
  }

  input FileInput {
    file: Upload!
    desc: String
  }
`;

const resolvers = {
  Query: {
    files: () => files,
    datafiles: async () => {
      return Desc.find({});
    }
  },
  Mutation: {
    uploadFile: async (_, { files, data }) => {
      console.log('uploadfile: ', data);
      const uploading = files.map(async (file, i) => {
        const { createReadStream, filename } = await file;
        const doc = await new Desc({ description: data[i] }).save();
        console.log(`Doc ID: ${doc.id}`);
        await new Promise(res =>
          createReadStream()
            .pipe(createWriteStream(path.join(__dirname, "../images", `${doc._id}.jpg`)))
            .on("close", res)
        ).catch((err) => console.log('err saving: ', err));
        return doc._id;
      });
      const ids = await Promise.all(uploading).then(data => data.map(({_id}) =>_id));
      axios({
        method: 'post',
        url: 'http://192.168.1.16:6000/filter',
        data: {
          ids
        }
      });
      return true;
    },
    uploadMultipleFiles: async (_, { files }) => {
      console.log('uploadfiles');
      const upload = files.map(async ({ file, desc }) => {
        const { createReadStream, filename } = await file;
        const doc = await new Desc({ description: desc }).save();
        await new Promise(res =>
          createReadStream()
            .pipe(createWriteStream(path.join(__dirname, "../images", `${doc._id}.jpg`)))
            .on("close", res)
        ).catch((err) => console.log('err saving: ', err));
      })
      await Promise.all(upload);

      return true;
    },
    testAppendDesc: async (_, { desc }) => {
      return new Desc({ description: desc }).save();
    },
    testMultipleAppendDesc: async (_, { desc }) => {
      const multi = desc.map(async d => {
       return await new Desc({ description: d }).save();
      });
      
      return multi;
    },
    deleteDesc: async (_, { id }) => {
      await Desc.deleteOne({ _id: id });
      await unlink(path.join(__dirname, "../images", `${id}.jpg`), (err) => {
        if (err) {
          console.error(err)
          return
        }
        //file removed
      })
      return true;
    }
  }
};

existsSync(path.join(__dirname, "../images")) || mkdirSync(path.join(__dirname, "../images"));

const server = new ApolloServer({ typeDefs, resolvers });
const app = express();
app.use("/images", express.static(path.join(__dirname, "../images")));
server.applyMiddleware({ app });

app.listen(4000, /*'192.168.1.16',*/() => {
  console.log(`🚀  Server ready at http://192.168.1.16:4000/`);
});
