FROM python:3
WORKDIR /usr/src/app
EXPOSE 5000
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src .
CMD python3 production.py