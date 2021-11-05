FROM node:14 AS builder


# Update aptitude with new repo
RUN apt-get update
# Install software
RUN apt-get install -y git


# clone codebase
RUN git clone https://github.com/ODPReactor/odp-reactor-server.git /api
WORKDIR /api

# install webpack and dependencies
RUN npm install

# build software
RUN npm run build:notest



# create runner
FROM node:14

COPY --from=builder /api /api
WORKDIR /api
ENTRYPOINT ["npm", "start"]
