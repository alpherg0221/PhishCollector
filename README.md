# PhishCollector

Tools for collecting phishing pages <br>

- client : Web app to support in collecting phishing pages
- collector : Web Crawler to collect phishing pages

## How to use

### Using client and collector

1. Clone this repository
    ```git
    git clone https://github.com/alpherg0221/PhishCollector.git
    ```
2. Execute the following command
    ```shell 
    cd PhishCollector 
    docker compose up --build
    ```
3. Access at http://localhost:34173/PhishCollector/home/

### Using client only

1. Execute the following command
    ```npm
    npm install
    npm run build
    npm run preview
    ```
2. Access at http://localhost:4173/PhishCollector/home/
