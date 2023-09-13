FROM nginx:alpine
COPY ./ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
