FROM node:18

ADD package.json /temp/package.json

ADD yarn.lock /temp/yarn.lock

RUN rm -rf build

RUN cd /temp && yarn install


ADD ./ /src

RUN rm -rf src/node_modules && cp -a /temp/node_modules /src

WORKDIR /src

RUN yarn build

CMD ["node", "build/src/app.js"]

