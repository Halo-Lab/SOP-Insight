FROM node:20-alpine

RUN apk add --no-cache git

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package*.json /usr/src/app/
RUN npm install && npm cache clean --force

COPY ./ /usr/src/app

# Add environment variables
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ENV SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV SERVER_PORT=${SERVER_PORT}

EXPOSE ${SERVER_PORT}

RUN npm run build

CMD npm start 