FROM python:3.7.4

RUN mkdir -p /home/achargnav
WORKDIR /home/achargnav

RUN pip install --upgrade pip

ADD requirements.txt .
RUN pip install -r requirements.txt
RUN pip install gunicorn

ADD app app
ADD boot.sh ./
RUN chmod +x boot.sh

RUN mkdir uploaded_data

ENV FLASK_APP arg_navigation.py


EXPOSE 5000
ENTRYPOINT ["./boot.sh"]
