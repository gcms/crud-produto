FROM httpd:2.4-alpine

EXPOSE 80
VOLUME /usr/local/apache2/htdocs

RUN echo 'AliasMatch "^/[0-9]*$" "/usr/local/apache2/htdocs/index.html"' >> conf/httpd.conf
