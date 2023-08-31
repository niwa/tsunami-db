FROM nginx:alpine
COPY ./ /usr/share/nginx/html


VOLUME /usr/share/nginx/html
VOLUME /etc/nginx
