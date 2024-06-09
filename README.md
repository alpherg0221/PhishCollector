# PhishCollector

Tools for collecting phishing pages <br>

- client : Web app to support in collecting phishing pages
- collector : Web Crawler to collect phishing pages

## How to use

### Using client and collector

1. Clone this repository
    ```git
    $ git clone https://github.com/alpherg0221/PhishCollector.git
    ```

2. Open the `.env` file and set the `PHISH_COLLECTOR_SAVE_DIR` to the directory where the collected phishing pages will be saved.
   ```
    PHISH_COLLECTOR_SAVE_DIR=/path/to/save/dir
    ```

3. Start containers
    ```shell
    docker compose up --build
    ```

4. Access at http://localhost:34173/PhishCollector/home/

### Using client only

1. Execute the following command
    ```npm
    $ npm install
    $ npm run build
    $ npm run preview
    ```
2. Access at http://localhost:4173/PhishCollector/home/
