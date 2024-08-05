# from selenium import webdriver
# from selenium.webdriver.chrome.options import Options
#
#
# def selenium_options() -> Options:
#     options = webdriver.ChromeOptions()
#     options.add_argument("--ignore-certificate-errors")  # SSLエラー無視
#     options.add_argument("--disable-blink-features=AutomationControlled")  # 検出回避
#     options.add_argument("--no-sandbox")  # Dockerで動かすために必要
#     options.add_argument("--user-data-dir=/home/collector/profile")  # GSBリストデータ保存に必要
#
#     # Enable GSB
#     options.add_experimental_option("excludeSwitches", [
#         "disable-background-networking",
#         "disable-client-side-phishing-detection",
#     ])
#     options.add_experimental_option("prefs", {
#         "safebrowsing.enabled": True,
#         "safebrowsing.enhanced": True,
#     })
#
#     options.binary_location = "/opt/google/chrome/chrome"
#
#     return options


def playwright_ignore_args() -> list[str]:
    return [
        "--disable-background-networking",
        "--disable-client-side-phishing-detection",
    ]


def playwright_args() -> list[str]:
    return [
        "--disable-blink-features=AutomationControlled",
        "--start-maximized",
    ]
