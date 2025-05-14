# build environment
FROM node:18 as builder
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package*.json /usr/src/app/
RUN npm install && npm cache clean --force

COPY ./ /usr/src/app


ARG VITE_API_URL=http://localhost:3000
ARG VITE_SENTRY_DSN=

RUN echo "VITE_API_URL=${VITE_API_URL}" > .env && \
    if [ ! -z "${VITE_SENTRY_DSN}" ]; then \
      echo "VITE_SENTRY_DSN=${VITE_SENTRY_DSN}" >> .env; \
    fi

RUN npm run build

# production environment
FROM nginx:1.23.3-alpine
RUN rm -rf /etc/nginx/conf.d
RUN mkdir -p /etc/nginx/conf.d
COPY ./default.conf /etc/nginx/conf.d/
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 